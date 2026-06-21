package com.exstasia.portfolio.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GalleryUpdateRequest {
    private String coverImagePath;
}
