package com.exstasia.portfolio.service;

import com.exstasia.portfolio.dto.LayoutUpdateRequest;
import com.exstasia.portfolio.dto.MediaDto;
import com.exstasia.portfolio.dto.MediaLayoutDto;
import com.exstasia.portfolio.entity.Gallery;
import com.exstasia.portfolio.entity.Media;
import com.exstasia.portfolio.entity.Orientation;
import com.exstasia.portfolio.exception.ResourceNotFoundException;
import com.exstasia.portfolio.repository.MediaRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class MediaService {

    private final MediaRepository mediaRepository;
    private final GalleryService galleryService;
    private final FileStorageService fileStorageService;
    private final LayoutService layoutService;

    public MediaService(
            MediaRepository mediaRepository,
            GalleryService galleryService,
            FileStorageService fileStorageService,
            LayoutService layoutService) {
        this.mediaRepository = mediaRepository;
        this.galleryService = galleryService;
        this.fileStorageService = fileStorageService;
        this.layoutService = layoutService;
    }

    @Transactional(readOnly = true)
    public List<MediaDto> getGalleryMedia(Long galleryId) {
        return mediaRepository.findByGalleryIdOrderByRowGroupAscDisplayOrderAsc(galleryId)
                .stream()
                .map(MediaDto::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<Media> getGalleryMediaEntities(Long galleryId) {
        return mediaRepository.findByGalleryIdOrderByRowGroupAscDisplayOrderAsc(galleryId);
    }

    @Transactional
    public List<MediaDto> uploadMedia(Long galleryId, MultipartFile[] files) throws IOException {
        Gallery gallery = galleryService.getGalleryEntityById(galleryId);
        List<String> storedFiles = new ArrayList<>();
        List<Media> savedMediaList = new ArrayList<>();

        try {
            for (MultipartFile file : files) {
                // storeFile validates the upload and reports the dimensions it read
                // from the image header, so the file is never re-read here.
                FileStorageService.StoredImage stored = fileStorageService.storeFile(file);
                storedFiles.add(stored.fileName());

                int width = stored.width();
                int height = stored.height();
                Orientation orientation = (width > height) ? Orientation.LANDSCAPE : Orientation.PORTRAIT;

                Media media = Media.builder()
                        .gallery(gallery)
                        .filePath(stored.fileName())
                        .originalFilename(file.getOriginalFilename())
                        .mimeType(stored.contentType())
                        .fileSizeBytes(file.getSize())
                        .widthPx(width)
                        .heightPx(height)
                        .orientation(orientation)
                        .build();

                savedMediaList.add(mediaRepository.save(media));
            }

            // Run auto arrange layout
            layoutService.autoArrange(galleryId);

        } catch (Exception e) {
            // Clean up files in case of DB or formatting failure
            for (String fileName : storedFiles) {
                fileStorageService.deleteFile(fileName);
            }
            throw e;
        }

        // Return latest state for saved items
        return savedMediaList.stream()
                .map(m -> mediaRepository.findById(m.getId()).orElse(m))
                .map(MediaDto::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional
    public void deleteMedia(Long mediaId) {
        Media media = mediaRepository.findById(mediaId)
                .orElseThrow(() -> new ResourceNotFoundException("Media not found with ID: " + mediaId));

        mediaRepository.delete(media);
        fileStorageService.deleteFile(media.getFilePath());
    }

    @Transactional
    public void batchUpdateLayout(LayoutUpdateRequest request) {
        for (LayoutUpdateRequest.UpdateItem update : request.getUpdates()) {
            Media media = mediaRepository.findById(update.getId())
                    .orElseThrow(() -> new ResourceNotFoundException("Media not found with ID: " + update.getId()));
            media.setRowGroup(update.getRowGroup());
            media.setDisplayOrder(update.getDisplayOrder());
            mediaRepository.save(media);
        }
    }

    @Transactional
    public MediaDto updateSingleMediaLayout(Long id, MediaLayoutDto dto) {
        Media media = mediaRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Media not found with ID: " + id));
        media.setRowGroup(dto.getRowGroup());
        media.setDisplayOrder(dto.getDisplayOrder());
        return MediaDto.fromEntity(mediaRepository.save(media));
    }
}
