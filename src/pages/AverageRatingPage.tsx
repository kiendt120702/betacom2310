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
    0,
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
    <div className="container mx-auto p-6 max-w-6xl">
      {/* Header */}
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
          ⭐ Tính Trung Bình Đánh Giá
        </h1>
        <p className="text-muted-foreground">
          Công cụ tính toán điểm trung bình và số đánh giá 5 sao cần thiết
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Phần tính trung bình */}
        <Card className="shadow-lg border-0 bg-gradient-to-br from-white to-blue-50/50 dark:from-gray-900 dark:to-blue-900/10">
          <CardHeader className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border-b">
            <CardTitle className="text-xl text-foreground flex items-center gap-2">
              <Calculator className="w-5 h-5" />
              Nhập Số Lượng Đánh Giá
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              Vui lòng nhập số lượng đánh giá tương ứng với từng mức sao
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 pt-6 px-6">
            {/* Input fields for each star rating */}
            <div className="space-y-3">
              {[
                { key: "fiveStar" as const, stars: 5 },
                { key: "fourStar" as const, stars: 4 },
                { key: "threeStar" as const, stars: 3 },
                { key: "twoStar" as const, stars: 2 },
                { key: "oneStar" as const, stars: 1 },
              ].map(({ key, stars }) => (
                <div key={key} className="flex items-center gap-3">
                  <div className="flex items-center gap-2 min-w-[100px] max-w-[120px] flex-shrink-0">
                    {renderStars(stars)}
                  </div>
                  <div className="flex-1">
                    <Input
                      type="text"
                      value={ratings[key]}
                      onChange={(e) => handleInputChange(key, e.target.value)}
                      placeholder="0"
                      className="text-center h-11 bg-background border-border text-foreground transition-all duration-200 hover:border-primary/50 focus:border-primary"
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Total reviews display - ALWAYS show */}
            <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/50 dark:to-purple-950/50 rounded-lg border border-blue-200 dark:border-blue-800">
              <p className="text-sm font-medium text-blue-800 dark:text-blue-200 flex items-center justify-between">
                <span>Tổng số đánh giá:</span>
                <span className="text-lg font-bold">
                  {totalReviews}
                </span>
              </p>
            </div>

            {/* Action buttons */}
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={resetForm}
                disabled={totalReviews === 0 && average === 0}
                className="h-12 w-full bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 hover:from-gray-100 hover:to-gray-200 dark:hover:from-gray-700 dark:hover:to-gray-600 border-border text-foreground transition-all duration-200"
              >
                🔄 Đặt Lại
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Phần hiển thị kết quả và tính số đánh giá 5 sao cần thiết */}
        <div className="space-y-6">
          {/* Always show average card */}
          <Card className="shadow-lg border-0 bg-gradient-to-br from-white to-yellow-50/50 dark:from-gray-900 dark:to-yellow-900/10">
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 mb-4">
                  {renderStars(Math.round(average))}
                </div>
                <div className="bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
                  <p className="text-5xl font-bold mb-2">
                    {average.toFixed(1)}
                  </p>
                </div>
                <div className="bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-950/50 dark:to-orange-950/50 rounded-lg p-3 border border-yellow-200 dark:border-yellow-800">
                  <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                    Điểm trung bình từ {totalReviews} đánh giá
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-0 bg-gradient-to-br from-white to-green-50/50 dark:from-gray-900 dark:to-green-900/10">
            <CardHeader className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 border-b">
              <CardTitle className="flex items-center gap-2 text-lg leading-tight text-foreground">
                <Target className="w-5 h-5" />
                Số lượng đánh giá 5⭐ cần thêm để đạt mục tiêu
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-6 px-6">
              {totalReviews === 0 ? (
                <div className="text-center py-8">
                  <div className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
                    <Calculator className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                    <p className="text-muted-foreground">
                      Vui lòng nhập số lượng đánh giá để tính toán
                    </p>
                  </div>
                </div>
              ) : (
                targets.map(({ rating, display, icon }) => {
                  const needed = calculateFiveStarsNeeded(rating);
                  const isAchieved = average >= rating; // Use the state `average`

                  return (
                    <div
                      key={rating}
                      className={`p-4 rounded-lg border transition-all duration-200 ${
                        isAchieved
                          ? "bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/50 dark:to-emerald-950/50 border-green-200 dark:border-green-800 shadow-sm"
                          : "bg-gradient-to-r from-gray-50 to-slate-50 dark:from-gray-800/50 dark:to-slate-800/50 border-gray-200 dark:border-gray-700 hover:shadow-sm"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 flex items-center justify-center text-white font-bold text-lg shadow-sm">
                            {display}
                          </div>
                          <span className="text-lg font-semibold text-foreground">
                            Mục tiêu {icon}
                          </span>
                        </div>
                        <div className="text-right">
                          {isAchieved ? (
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center">
                                <span className="text-white text-lg">✓</span>
                              </div>
                              <span className="font-bold text-green-600 dark:text-green-400">
                                Đã đạt
                              </span>
                            </div>
                          ) : (
                            <div className="bg-primary/10 rounded-lg px-4 py-2">
                              <p className="text-lg font-bold text-primary">
                                Cần {needed} đánh giá 5⭐
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AverageRatingPage;
