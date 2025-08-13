import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Heart, TrendingUp, Users } from "lucide-react";
import { useTopLikedThumbnails } from "@/hooks/useThumbnailLikes";
import LazyImage from "@/components/LazyImage";

const ThumbnailLikesStats = () => {
  const { data: topLikedThumbnails, isLoading } = useTopLikedThumbnails(10);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5 text-red-500" />
            Thumbnail được yêu thích nhất
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!topLikedThumbnails || topLikedThumbnails.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5 text-red-500" />
            Thumbnail được yêu thích nhất
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <Heart className="h-12 w-12 mx-auto mb-4 opacity-20" />
            <p>Chưa có thumbnail nào được thích</p>
            <p className="text-sm">Các thumbnail được yêu thích sẽ hiển thị ở đây</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const totalLikes = topLikedThumbnails.reduce((sum, thumbnail) => sum + thumbnail.like_count, 0);
  const averageLikes = Math.round(totalLikes / topLikedThumbnails.length);

  return (
    <div className="space-y-6">
      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-50 rounded-lg">
                <Heart className="h-5 w-5 text-red-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{totalLikes}</p>
                <p className="text-sm text-muted-foreground">Tổng lượt thích</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-50 rounded-lg">
                <TrendingUp className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{averageLikes}</p>
                <p className="text-sm text-muted-foreground">Trung bình lượt thích</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-50 rounded-lg">
                <Users className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{topLikedThumbnails.length}</p>
                <p className="text-sm text-muted-foreground">Thumbnail có lượt thích</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Liked Thumbnails */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5 text-red-500" />
            Top Thumbnail được yêu thích nhất
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {topLikedThumbnails.map((thumbnail, index) => (
              <div
                key={thumbnail.id}
                className="flex items-center gap-4 p-3 rounded-lg border bg-background hover:bg-muted/50 transition-colors"
              >
                {/* Ranking */}
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-sm font-bold text-primary">#{index + 1}</span>
                </div>

                {/* Thumbnail */}
                <div className="flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden bg-muted">
                  <LazyImage
                    src={thumbnail.image_url}
                    alt={thumbnail.name}
                    className="w-full h-full object-cover"
                    placeholderClassName="w-full h-full"
                  />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium truncate" title={thumbnail.name}>
                    {thumbnail.name}
                  </h4>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline" className="text-xs">
                      {thumbnail.status}
                    </Badge>
                    <div className="flex flex-wrap gap-1">
                      {thumbnail.banner_type_names && thumbnail.banner_type_names.length > 0 ? (
                        thumbnail.banner_type_names.map((name, idx) => (
                          <Badge key={idx} variant="secondary" className="text-xs px-1 py-0.5">
                            {name}
                          </Badge>
                        ))
                      ) : null}
                    </div>
                  </div>
                </div>

                {/* Like Count */}
                <div className="flex-shrink-0 flex items-center gap-1 text-red-500">
                  <Heart className="h-4 w-4 fill-current" />
                  <span className="font-semibold">{thumbnail.like_count}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ThumbnailLikesStats;