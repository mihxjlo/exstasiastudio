package com.exstasia.portfolio.controller;

import com.exstasia.portfolio.dto.GalleryDto;
import com.exstasia.portfolio.dto.GalleryUpdateRequest;
import com.exstasia.portfolio.dto.GalleryWithMediaDto;
import com.exstasia.portfolio.entity.Gallery;
import com.exstasia.portfolio.entity.Media;
import com.exstasia.portfolio.service.GalleryService;
import com.exstasia.portfolio.service.MediaService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/galleries")
public class GalleryController {

    private final GalleryService galleryService;
    private final MediaService mediaService;

    public GalleryController(GalleryService galleryService, MediaService mediaService) {
        this.galleryService = galleryService;
        this.mediaService = mediaService;
    }

    @GetMapping
    public ResponseEntity<List<GalleryDto>> getAllGalleries() {
        return ResponseEntity.ok(galleryService.getAllGalleries());
    }

    @GetMapping("/{slug}")
    public ResponseEntity<GalleryWithMediaDto> getGalleryBySlug(@PathVariable String slug) {
        Gallery gallery = galleryService.getGalleryEntityBySlug(slug);
        List<Media> mediaEntities = mediaService.getGalleryMediaEntities(gallery.getId());
        return ResponseEntity.ok(GalleryWithMediaDto.fromEntity(gallery, mediaEntities));
    }

    @PutMapping("/{id}")
    public ResponseEntity<GalleryDto> updateGalleryCover(
            @PathVariable Long id,
            @RequestBody GalleryUpdateRequest request) {
        return ResponseEntity.ok(galleryService.updateGalleryCover(id, request));
    }
}
