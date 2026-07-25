package com.exstasia.portfolio.controller;

import com.exstasia.portfolio.dto.LoginRequest;
import com.exstasia.portfolio.dto.LoginResponse;
import com.exstasia.portfolio.service.AuthService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@Valid @RequestBody LoginRequest request,
                                               HttpServletRequest httpRequest) {
        // With server.forward-headers-strategy=framework this is the real client
        // address taken from X-Forwarded-For, not the ingress controller's address.
        return ResponseEntity.ok(authService.login(request, httpRequest.getRemoteAddr()));
    }
}
