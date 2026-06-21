package com.exstasia.portfolio.service;

import com.exstasia.portfolio.dto.HeroImageDto;
import com.exstasia.portfolio.entity.HeroImage;
import com.exstasia.portfolio.repository.HeroImageRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDateTime;

@Service
public class HeroService {

    private static final long HERO_ROW_ID = 1L;

    private final HeroImageRepository heroImageRepository;
    private final FileStorageService fileStorageService;

    public HeroService(HeroImageRepository heroImageRepository, FileStorageService fileStorageService) {
        this.heroImageRepository = heroImageRepository;
        this.fileStorageService = fileStorageService;
    }

    public HeroImageDto getHero() {
        return heroImageRepository.findById(HERO_ROW_ID)
                .map(h -> new HeroImageDto(h.getFilePath()))
                .orElse(new HeroImageDto(null));
    }

    @Transactional
    public HeroImageDto uploadHero(MultipartFile file) throws IOException {
        HeroImage hero = heroImageRepository.findById(HERO_ROW_ID)
                .orElse(HeroImage.builder().id(HERO_ROW_ID).build());

        if (hero.getFilePath() != null) {
            fileStorageService.deleteFile(hero.getFilePath());
        }

        String newPath = fileStorageService.storeFile(file);
        hero.setFilePath(newPath);
        hero.setUpdatedAt(LocalDateTime.now());
        heroImageRepository.save(hero);

        return new HeroImageDto(newPath);
    }
}
