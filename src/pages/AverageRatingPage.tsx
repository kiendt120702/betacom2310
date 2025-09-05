"use client";

import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Star, Calculator, Target } from "lucide-react";

const AverageRatingPage = () => {
  const [ratings, setRatings] = useState({
    fiveStar: "",
    fourStar: "",
    threeStar: "",
    twoStar: "",
    oneStar: "",
  });
  // Initialize average to 0 instead of null
  const [average, setAverage] = useState<number>(0);

  // Calculate total reviews whenever ratings change
  const totalReviews = Object.values(ratings).reduce(
    (sum, value) => sum + (parseInt(value) || 0),
    0
  );

  // Recalculate average whenever ratings change
  useEffect(() => {
    const five = parseInt(ratings.fiveStar) || 0;
    const four = parseInt(ratings.fourStar) || 0;
    const three = parseInt(ratings.threeStar) || 0;
    const two = parseInt(ratings.twoStar) || 0;
    const one = parseInt(ratings.oneStar) || 0;

    const currentTotal = five + four + three + two + one;

    if (currentTotal === 0) {
      setAverage(0);
      return;
    }

    const weightedSum = five * 5 + four * 4 + three * 3 + two * 2 + one * 1;
    const calculatedAverage = weightedSum / currentTotal;

    setAverage(Math.round(calculatedAverage * 10) / 10);
  }, [ratings]); // Dependency array includes ratings

  const handleInputChange = (star: keyof typeof ratings, value: string) => {
    // Chỉ cho phép số nguyên không âm
    if (value === "" || (/^\d+$/.test(value) && parseInt(value) >= 0)) {
      setRatings((prev) => ({ ...prev, [star]: value }));
    }
  };

  const calculateFiveStarsNeeded = (targetRating: number) => {
    const five = parseInt(ratings.fiveStar) || 0;
    const four = parseInt(ratings.fourStar) || 0;
    const three = parseInt(ratings.threeStar) || 0;
    const two = parseInt(ratings.twoStar) || 0;
    const one = parseInt(ratings.oneStar) || 0;

    const currentTotalReviews = five + four + three + two + one;
    const currentWeightedSum =
      five * 5 + four * 4 + three * 3 + two * 2 + one * 1;

    // If no reviews, or target is already met/exceeded, or target is 5.0 and current is already 5.0
    if (currentTotalReviews === 0) return null; // Indicate no calculation needed yet
    if (average >= targetRating) return 0; // Already achieved or surpassed

    const numerator = targetRating * currentTotalReviews - currentWeightedSum;
    const denominator = 5 - targetRating;

    if (denominator <= 0) return 0; // Should not happen if targetRating < 5
    if (numerator <= 0) return 0; // Already achieved or surpassed

    return Math.ceil(numerator / denominator);
  };

  const resetForm = () => {
    setRatings({
      fiveStar: "",
      fourStar: "",
      threeStar: "",
      twoStar: "",
      oneStar: "",
    });
    // average will be reset to 0 by the useEffect
  };

  const renderStars = (count: number) => {
    return Array.from({ length: 5 }, (_, index) => (
      <Star
        key={index}
        className={`w-5 h-5 ${
          index < count ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
        }`}
      />
    ));
  };

  const targets = [
    { rating: 4.75, display: "4.8", icon: "4.8⭐" },
    { rating: 4.85, display: "4.9", icon: "4.9⭐" },
    { rating: 4.95, display: "5.0", icon: "5.0⭐" },
  ];

  return (
    <div>
      {/* Header */}
      <div className="bg-card rounded-lg shadow-sm p-6 mb-8 border">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Calculator className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              Tính Trung Bình Đánh Giá
            </h1>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Section */}
        <Card className="border shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="h-5 w-5 text-primary" />
              Nhập Số Lượng Đánh Giá
            </CardTitle>
            <CardDescription>
              Vui lòng nhập số lượng đánh giá tương ứng với từng mức sao
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Star Rating Inputs */}
            <div className="space-y-4">
              {[
                { key: "fiveStar" as const, stars: 5 },
                { key: "fourStar" as const, stars: 4 },
                { key: "threeStar" as const, stars: 3 },
                { key: "twoStar" as const, stars: 2 },
                { key: "oneStar" as const, stars: 1 },
              ].map(({ key, stars }) => (
                <div key={key} className="space-y-2">
                  <Label className="text-sm font-medium flex items-center gap-2">
                    {renderStars(stars)}
                    <span>({stars} sao)</span>
                  </Label>
                  <Input
                    type="text"
                    value={ratings[key]}
                    onChange={(e) => handleInputChange(key, e.target.value)}
                    placeholder="0"
                    className="text-center"
                  />
                </div>
              ))}
            </div>

            {/* Total Reviews */}
            <div className="p-4 bg-muted/50 rounded-lg border">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Tổng số đánh giá:</span>
                <span className="text-lg font-bold text-primary">
                  {totalReviews}
                </span>
              </div>
            </div>

            {/* Reset Button */}
            <Button
              variant="outline"
              onClick={resetForm}
              disabled={totalReviews === 0 && average === 0}
              className="w-full">
              Đặt lại
            </Button>
          </CardContent>
        </Card>

        {/* Results Section */}
        <div className="space-y-6">
          {/* Average Rating Display */}
          <Card className="border shadow-sm">
            <CardContent className="pt-6">
              <div className="text-center space-y-4">
                <div className="flex items-center justify-center gap-1">
                  {renderStars(Math.round(average))}
                </div>
                <div>
                  <p className="text-4xl font-bold text-primary mb-2">
                    {average.toFixed(1)}
                  </p>
                  <div className="p-3 bg-muted/50 rounded-lg border">
                    <p className="text-sm text-muted-foreground">
                      Điểm trung bình từ {totalReviews} đánh giá
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Target Calculations */}
          <Card className="border shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-primary" />
                Đánh giá 5 sao cần thêm
              </CardTitle>
              <CardDescription>
                Số lượng đánh giá 5 sao cần thiết để đạt các mục tiêu
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {totalReviews === 0 ? (
                <div className="text-center py-8">
                  <div className="p-6 bg-muted/30 rounded-lg border">
                    <Calculator className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
                    <p className="text-muted-foreground">
                      Vui lòng nhập số lượng đánh giá để tính toán
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  {targets.map(({ rating, display, icon }) => {
                    const needed = calculateFiveStarsNeeded(rating);
                    const isAchieved = average >= rating;

                    return (
                      <div
                        key={rating}
                        className={`p-4 rounded-lg border ${
                          isAchieved
                            ? "bg-green-50 border-green-200 dark:bg-green-950/30 dark:border-green-800"
                            : "bg-background border-border hover:bg-muted/30"
                        }`}>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                                <span className="text-sm font-bold text-primary">
                                  {display}
                                </span>
                              </div>
                              <span className="font-medium">
                                Mục tiêu {display} sao
                              </span>
                            </div>
                          </div>
                          <div className="text-right">
                            {isAchieved ? (
                              <div className="flex items-center gap-2">
                                <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center">
                                  <span className="text-white text-xs">✓</span>
                                </div>
                                <span className="text-sm font-medium text-green-600 dark:text-green-400">
                                  Đã đạt
                                </span>
                              </div>
                            ) : (
                              <div className="text-right">
                                <p className="text-lg font-bold text-primary">
                                  {needed}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  đánh giá 5 sao
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AverageRatingPage;
