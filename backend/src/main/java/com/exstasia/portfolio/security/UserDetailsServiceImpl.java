package com.exstasia.portfolio.security;

import com.exstasia.portfolio.entity.AdminUser;
import com.exstasia.portfolio.repository.AdminUserRepository;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import java.util.Collections;

@Service
public class UserDetailsServiceImpl implements UserDetailsService {

    private final AdminUserRepository adminUserRepository;

    public UserDetailsServiceImpl(AdminUserRepository adminUserRepository) {
        this.adminUserRepository = adminUserRepository;
    }

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        AdminUser adminUser = adminUserRepository.findByEmail(username)
                .orElseThrow(() -> new UsernameNotFoundException("Admin user not found with email: " + username));

        return new User(
                adminUser.getEmail(),
                adminUser.getHashedPassword(),
                Collections.emptyList()
        );
    }
}
