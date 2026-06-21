package com.exstasia.portfolio.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import lombok.*;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LayoutUpdateRequest {

    @NotNull(message = "Updates list is required")
    @Valid
    private List<UpdateItem> updates;

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class UpdateItem {
        @NotNull(message = "Media ID is required")
        private Long id;

        @NotNull(message = "Row group is required")
        private Integer rowGroup;

        @NotNull(message = "Display order is required")
        private Integer displayOrder;
    }
}
