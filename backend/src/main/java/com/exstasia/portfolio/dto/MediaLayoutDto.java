package com.exstasia.portfolio.dto;

import jakarta.validation.constraints.NotNull;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MediaLayoutDto {
    @NotNull(message = "Row group is required")
    private Integer rowGroup;

    @NotNull(message = "Display order is required")
    private Integer displayOrder;
}
