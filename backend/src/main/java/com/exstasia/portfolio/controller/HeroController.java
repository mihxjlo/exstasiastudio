package com.exstasia.portfolio.controller;

import com.exstasia.portfolio.dto.HeroImageDto;
import com.exstasia.portfolio.service.HeroService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

@RestController
@RequestMapping("/api/hero")
public class HeroController {

    private final HeroService heroService;

    public HeroController(HeroService heroService) {
        this.heroService = heroService;
    }

    @GetMapping
    public ResponseEntity<HeroImageDto> getHero() {
        return ResponseEntity.ok(heroService.getHero());
    }

    @PostMapping
    public ResponseEntity<HeroImageDto> uploadHero(@RequestParam("file") MultipartFile file) throws IOException {
        return ResponseEntity.ok(heroService.uploadHero(file));
    }
}
