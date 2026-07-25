package com.exstasia.portfolio.service;

import com.exstasia.portfolio.dto.LoginRequest;
import com.exstasia.portfolio.dto.LoginResponse;
import com.exstasia.portfolio.exception.TooManyAttemptsException;
import com.exstasia.portfolio.security.JwtUtil;
import com.exstasia.portfolio.security.LoginAttemptService;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final JwtUtil jwtUtil;
    private final LoginAttemptService loginAttemptService;

    public AuthService(AuthenticationManager authenticationManager,
                       JwtUtil jwtUtil,
                       LoginAttemptService loginAttemptService) {
        this.authenticationManager = authenticationManager;
        this.jwtUtil = jwtUtil;
        this.loginAttemptService = loginAttemptService;
    }

    public LoginResponse login(LoginRequest request, String clientId) {
        if (loginAttemptService.isBlocked(clientId)) {
            throw new TooManyAttemptsException(loginAttemptService.retryAfterSeconds(clientId));
        }

        Authentication authentication;
        try {
            authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
            );
        } catch (AuthenticationException ex) {
            loginAttemptService.recordFailure(clientId);
            throw ex;
        }

        loginAttemptService.recordSuccess(clientId);

        String token = jwtUtil.generateToken(authentication.getName());
        return LoginResponse.builder()
                .token(token)
                .expiresIn(jwtUtil.getExpirationMs())
                .build();
    }
}
