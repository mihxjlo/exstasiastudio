package com.exstasia.portfolio.dto;

import com.exstasia.portfolio.entity.Media;
import lombok.*;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MediaDto {
    private Long id;
    private Long galleryId;
    private String filePath;
    private String originalFilename;
    private String mimeType;
    private Long fileSizeBytes;
    private Integer widthPx;
    private Integer heightPx;
    private String orientation;
    private Integer rowGroup;
    private Integer displayOrder;
    private LocalDateTime createdAt;

    public static MediaDto fromEntity(Media media) {
        if (media == null) return null;
        return MediaDto.builder()
                .id(media.getId())
                .galleryId(media.getGallery() != null ? media.getGallery().getId() : null)
                .filePath(media.getFilePath())
                .originalFilename(media.getOriginalFilename())
                .mimeType(media.getMimeType())
                .fileSizeBytes(media.getFileSizeBytes())
                .widthPx(media.getWidthPx())
                .heightPx(media.getHeightPx())
                .orientation(media.getOrientation() != null ? media.getOrientation().name() : null)
                .rowGroup(media.getRowGroup())
                .displayOrder(media.getDisplayOrder())
                .createdAt(media.getCreatedAt())
                .build();
    }
}
