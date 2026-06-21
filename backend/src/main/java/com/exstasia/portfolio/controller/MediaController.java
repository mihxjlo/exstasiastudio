package com.exstasia.portfolio.controller;

import com.exstasia.portfolio.dto.LayoutUpdateRequest;
import com.exstasia.portfolio.dto.MediaDto;
import com.exstasia.portfolio.dto.MediaLayoutDto;
import com.exstasia.portfolio.service.LayoutService;
import com.exstasia.portfolio.service.MediaService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api")
public class MediaController {

    private final MediaService mediaService;
    private final LayoutService layoutService;

    public MediaController(MediaService mediaService, LayoutService layoutService) {
        this.mediaService = mediaService;
        this.layoutService = layoutService;
    }

    @GetMapping("/galleries/{id}/media")
    public ResponseEntity<List<MediaDto>> getGalleryMedia(@PathVariable Long id) {
        return ResponseEntity.ok(mediaService.getGalleryMedia(id));
    }

    @PostMapping("/galleries/{id}/media")
    public ResponseEntity<List<MediaDto>> uploadMedia(
            @PathVariable Long id,
            @RequestParam("files") MultipartFile[] files) throws IOException {
        return ResponseEntity.ok(mediaService.uploadMedia(id, files));
    }

    @DeleteMapping("/media/{id}")
    public ResponseEntity<Void> deleteMedia(@PathVariable Long id) {
        mediaService.deleteMedia(id);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/media/{id}")
    public ResponseEntity<MediaDto> updateSingleMediaLayout(
            @PathVariable Long id,
            @Valid @RequestBody MediaLayoutDto dto) {
        return ResponseEntity.ok(mediaService.updateSingleMediaLayout(id, dto));
    }

    @PutMapping("/media/layout")
    public ResponseEntity<Void> batchUpdateLayout(@Valid @RequestBody LayoutUpdateRequest request) {
        mediaService.batchUpdateLayout(request);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/galleries/{id}/media/auto-arrange")
    public ResponseEntity<Void> autoArrange(@PathVariable Long id) {
        layoutService.autoArrange(id);
        return ResponseEntity.ok().build();
    }
}
