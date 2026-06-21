package com.exstasia.portfolio.service;

import com.exstasia.portfolio.dto.GalleryDto;
import com.exstasia.portfolio.dto.GalleryUpdateRequest;
import com.exstasia.portfolio.entity.Gallery;
import com.exstasia.portfolio.exception.ResourceNotFoundException;
import com.exstasia.portfolio.repository.GalleryRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class GalleryService {

    private final GalleryRepository galleryRepository;

    public GalleryService(GalleryRepository galleryRepository) {
        this.galleryRepository = galleryRepository;
    }

    @Transactional(readOnly = true)
    public List<GalleryDto> getAllGalleries() {
        return galleryRepository.findAllByOrderByDisplayOrderAsc()
                .stream()
                .map(GalleryDto::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public Gallery getGalleryEntityBySlug(String slug) {
        return galleryRepository.findBySlug(slug)
                .orElseThrow(() -> new ResourceNotFoundException("Gallery not found with slug: " + slug));
    }

    @Transactional(readOnly = true)
    public Gallery getGalleryEntityById(Long id) {
        return galleryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Gallery not found with ID: " + id));
    }

    @Transactional(readOnly = true)
    public GalleryDto getGalleryBySlug(String slug) {
        return GalleryDto.fromEntity(getGalleryEntityBySlug(slug));
    }

    @Transactional
    public GalleryDto updateGalleryCover(Long id, GalleryUpdateRequest request) {
        Gallery gallery = getGalleryEntityById(id);
        gallery.setCoverImagePath(request.getCoverImagePath());
        return GalleryDto.fromEntity(galleryRepository.save(gallery));
    }
}
