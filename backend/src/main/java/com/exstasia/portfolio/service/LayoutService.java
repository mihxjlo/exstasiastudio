package com.exstasia.portfolio.service;

import com.exstasia.portfolio.entity.Media;
import com.exstasia.portfolio.entity.Orientation;
import com.exstasia.portfolio.repository.MediaRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

@Service
public class LayoutService {

    private final MediaRepository mediaRepository;

    public LayoutService(MediaRepository mediaRepository) {
        this.mediaRepository = mediaRepository;
    }

    @Transactional
    public void autoArrange(Long galleryId) {
        // 1. Fetch all media for the gallery ordered by created_at
        List<Media> allMedia = mediaRepository.findByGalleryId(galleryId);
        allMedia.sort(Comparator.comparing(Media::getCreatedAt));

        // 2. Separate into LANDSCAPE list and PORTRAIT list
        List<Media> landscapes = new ArrayList<>();
        List<Media> portraits = new ArrayList<>();

        for (Media media : allMedia) {
            if (media.getOrientation() == Orientation.LANDSCAPE) {
                landscapes.add(media);
            } else {
                portraits.add(media);
            }
        }

        // 3 & 4. Group into rows
        List<Row> rows = new ArrayList<>();

        // LANDSCAPE: each gets its own unique row
        for (Media landscape : landscapes) {
            List<Media> rowMedia = new ArrayList<>();
            rowMedia.add(landscape);
            rows.add(new Row(rowMedia, landscape.getCreatedAt()));
        }

        // PORTRAIT: pair consecutive portraits into groups of 2
        for (int i = 0; i < portraits.size(); i += 2) {
            List<Media> rowMedia = new ArrayList<>();
            rowMedia.add(portraits.get(i));
            LocalDateTime repTime = portraits.get(i).getCreatedAt();
            if (i + 1 < portraits.size()) {
                rowMedia.add(portraits.get(i + 1));
                if (portraits.get(i + 1).getCreatedAt().isBefore(repTime)) {
                    repTime = portraits.get(i + 1).getCreatedAt();
                }
            }
            rows.add(new Row(rowMedia, repTime));
        }

        // 5. Interleave rows by representative timestamp (sort rows)
        rows.sort(Comparator.comparing(Row::getRepresentativeTime));

        // 6. Assign final row_group and display_order values, batch save
        List<Media> mediaToSave = new ArrayList<>();
        for (int groupIdx = 0; groupIdx < rows.size(); groupIdx++) {
            Row row = rows.get(groupIdx);
            row.getMedia().sort(Comparator.comparing(Media::getCreatedAt));
            for (int orderIdx = 0; orderIdx < row.getMedia().size(); orderIdx++) {
                Media media = row.getMedia().get(orderIdx);
                media.setRowGroup(groupIdx);
                media.setDisplayOrder(orderIdx);
                mediaToSave.add(media);
            }
        }

        mediaRepository.saveAll(mediaToSave);
    }

    private static class Row {
        private final List<Media> media;
        private final LocalDateTime representativeTime;

        public Row(List<Media> media, LocalDateTime representativeTime) {
            this.media = media;
            this.representativeTime = representativeTime;
        }

        public List<Media> getMedia() {
            return media;
        }

        public LocalDateTime getRepresentativeTime() {
            return representativeTime;
        }
    }
}
