package com.exstasia.portfolio.dto;

import com.exstasia.portfolio.entity.Gallery;
import lombok.*;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GalleryDto {
    private Long id;
    private String title;
    private String slug;
    private String coverImagePath;
    private Integer displayOrder;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static GalleryDto fromEntity(Gallery gallery) {
        if (gallery == null) return null;
        return GalleryDto.builder()
                .id(gallery.getId())
                .title(gallery.getTitle())
                .slug(gallery.getSlug())
                .coverImagePath(gallery.getCoverImagePath())
                .displayOrder(gallery.getDisplayOrder())
                .createdAt(gallery.getCreatedAt())
                .updatedAt(gallery.getUpdatedAt())
                .build();
    }
}
