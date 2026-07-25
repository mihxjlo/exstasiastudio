package com.exstasia.portfolio.security;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Throttles repeated failed logins from the same client.
 *
 * <p>State is held in memory, so the limit applies per backend instance. That is
 * sufficient while the deployment runs a single replica; scaling out would need a
 * shared store such as Redis for the limit to hold cluster-wide.
 */
@Service
public class LoginAttemptService {

    /** Cap on tracked clients, so a distributed attack cannot grow the map without bound. */
    private static final int MAX_TRACKED_CLIENTS = 10_000;

    private final int maxAttempts;
    private final long lockoutMillis;

    /** Immutable value so readers always see a consistent snapshot. */
    private record Attempts(int failures, long expiresAt) {
    }

    private final Map<String, Attempts> byClient = new ConcurrentHashMap<>();

    public LoginAttemptService(
            @Value("${app.login.max-attempts}") int maxAttempts,
            @Value("${app.login.lockout-minutes}") long lockoutMinutes) {
        this.maxAttempts = maxAttempts;
        this.lockoutMillis = Duration.ofMinutes(lockoutMinutes).toMillis();
    }

    public boolean isBlocked(String clientId) {
        Attempts attempts = byClient.get(clientId);
        return attempts != null
                && attempts.failures() >= maxAttempts
                && System.currentTimeMillis() < attempts.expiresAt();
    }

    public long retryAfterSeconds(String clientId) {
        Attempts attempts = byClient.get(clientId);
        if (attempts == null) {
            return 0;
        }
        long remaining = attempts.expiresAt() - System.currentTimeMillis();
        return remaining > 0 ? (remaining + 999) / 1000 : 0;
    }

    /** Each failure also restarts the window, so sustained guessing stays locked out. */
    public void recordFailure(String clientId) {
        long now = System.currentTimeMillis();
        purgeExpiredIfCrowded(now);
        byClient.compute(clientId, (key, existing) -> {
            int failures = (existing == null || now >= existing.expiresAt()) ? 1 : existing.failures() + 1;
            return new Attempts(failures, now + lockoutMillis);
        });
    }

    public void recordSuccess(String clientId) {
        byClient.remove(clientId);
    }

    private void purgeExpiredIfCrowded(long now) {
        if (byClient.size() >= MAX_TRACKED_CLIENTS) {
            byClient.values().removeIf(attempts -> now >= attempts.expiresAt());
        }
    }
}
