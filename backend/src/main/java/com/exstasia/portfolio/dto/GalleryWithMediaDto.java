package com.exstasia.portfolio.dto;

import com.exstasia.portfolio.entity.Gallery;
import com.exstasia.portfolio.entity.Media;
import lombok.*;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GalleryWithMediaDto {
    private Long id;
    private String title;
    private String slug;
    private String coverImagePath;
    private Integer displayOrder;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private List<MediaDto> media;

    public static GalleryWithMediaDto fromEntity(Gallery gallery, List<Media> mediaList) {
        if (gallery == null) return null;
        List<MediaDto> mediaDtos = mediaList.stream()
                .map(MediaDto::fromEntity)
                .collect(Collectors.toList());
        return GalleryWithMediaDto.builder()
                .id(gallery.getId())
                .title(gallery.getTitle())
                .slug(gallery.getSlug())
                .coverImagePath(gallery.getCoverImagePath())
                .displayOrder(gallery.getDisplayOrder())
                .createdAt(gallery.getCreatedAt())
                .updatedAt(gallery.getUpdatedAt())
                .media(mediaDtos)
                .build();
    }
}
