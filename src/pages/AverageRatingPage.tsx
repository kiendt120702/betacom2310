import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Star, Calculator, Target } from 'lucide-react';

const AverageRatingPage = () => {
  const [ratings, setRatings] = useState({
    fiveStar: '',
    fourStar: '',
    threeStar: '',
    twoStar: '',
    oneStar: ''
  });
  const [average, setAverage] = useState<number | null>(null);

  const handleInputChange = (star: keyof typeof ratings, value: string) => {
    // Chỉ cho phép số nguyên không âm
    if (value === '' || (/^\d+$/.test(value) && parseInt(value) >= 0)) {
      setRatings(prev => ({ ...prev, [star]: value }));
    }
  };

  const calculateAverage = () => {
    const five = parseInt(ratings.fiveStar) || 0;
    const four = parseInt(ratings.fourStar) || 0;
    const three = parseInt(ratings.threeStar) || 0;
    const two = parseInt(ratings.twoStar) || 0;
    const one = parseInt(ratings.oneStar) || 0;

    const totalReviews = five + four + three + two + one;
    
    if (totalReviews === 0) {
      setAverage(0);
      return;
    }

    const weightedSum = (five * 5) + (four * 4) + (three * 3) + (two * 2) + (one * 1);
    const calculatedAverage = weightedSum / totalReviews;
    
    // Làm tròn đến 1 chữ số thập phân
    setAverage(Math.round(calculatedAverage * 10) / 10);
  };

  const calculateFiveStarsNeeded = (targetRating: number) => {
    const five = parseInt(ratings.fiveStar) || 0;
    const four = parseInt(ratings.fourStar) || 0;
    const three = parseInt(ratings.threeStar) || 0;
    const two = parseInt(ratings.twoStar) || 0;
    const one = parseInt(ratings.oneStar) || 0;

    const currentTotalReviews = five + four + three + two + one;
    const currentWeightedSum = (five * 5) + (four * 4) + (three * 3) + (two * 2) + (one * 1);

    // Công thức: (currentWeightedSum + x * 5) / (currentTotalReviews + x) >= targetRating
    // Giải phương trình: currentWeightedSum + 5x >= targetRating * (currentTotalReviews + x)
    // currentWeightedSum + 5x >= targetRating * currentTotalReviews + targetRating * x
    // 5x - targetRating * x >= targetRating * currentTotalReviews - currentWeightedSum
    // x * (5 - targetRating) >= targetRating * currentTotalReviews - currentWeightedSum
    // x >= (targetRating * currentTotalReviews - currentWeightedSum) / (5 - targetRating)

    const numerator = targetRating * currentTotalReviews - currentWeightedSum;
    const denominator = 5 - targetRating;

    if (denominator <= 0) return 0; // Không thể đạt được
    if (numerator <= 0) return 0; // Đã đạt được rồi

    return Math.ceil(numerator / denominator);
  };

  const resetForm = () => {
    setRatings({
      fiveStar: '',
      fourStar: '',
      threeStar: '',
      twoStar: '',
      oneStar: ''
    });
    setAverage(null);
  };

  const renderStars = (count: number) => {
    return Array.from({ length: 5 }, (_, index) => (
      <Star
        key={index}
        className={`w-5 h-5 ${
          index < count 
            ? 'fill-yellow-400 text-yellow-400' 
            : 'text-gray-300'
        }`}
      />
    ));
  };

  const totalReviews = Object.values(ratings).reduce((sum, value) => sum + (parseInt(value) || 0), 0);

  const targets = [
    { rating: 4.75, display: '4.8', icon: '4.8⭐' },
    { rating: 4.85, display: '4.9', icon: '4.9⭐' },
    { rating: 4.95, display: '5.0', icon: '5.0⭐' }
  ];

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-foreground mb-2 flex items-center justify-center gap-2">
          <Calculator className="w-8 h-8" />
          Tính Trung Bình Đánh Giá
        </h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6"> {/* Changed lg:grid-cols-2 to md:grid-cols-2 */}
        {/* Phần tính trung bình */}
        <Card className="shadow-lg border-border bg-card">
          <CardHeader className="pb-4 px-6">
            <CardTitle className="text-xl text-foreground">Nhập Số Lượng Đánh Giá</CardTitle>
            <CardDescription className="text-muted-foreground">
              Vui lòng nhập số lượng đánh giá tương ứng với từng mức sao
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 pt-6 px-6">
            {/* Input fields for each star rating */}
            <div className="space-y-3">
              {[
                { key: 'fiveStar' as const, label: '5 sao', stars: 5 },
                { key: 'fourStar' as const, label: '4 sao', stars: 4 },
                { key: 'threeStar' as const, label: '3 sao', stars: 3 },
                { key: 'twoStar' as const, label: '2 sao', stars: 2 },
                { key: 'oneStar' as const, label: '1 sao', stars: 1 }
              ].map(({ key, label, stars }) => (
                <div key={key} className="flex items-center gap-3">
                  <div className="flex items-center gap-2 min-w-[100px] max-w-[120px] flex-shrink-0">
                    {renderStars(stars)}
                    <span className="text-base font-medium text-foreground">{label}</span>
                  </div>
                  <div className="flex-1">
                    <Input
                      type="text"
                      value={ratings[key]}
                      onChange={(e) => handleInputChange(key, e.target.value)}
                      placeholder="0"
                      className="text-center h-11 bg-background border-border text-foreground"
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Total reviews display */}
            {totalReviews > 0 && (
              <div className="p-4 bg-muted rounded-lg border border-border">
                <p className="text-sm text-muted-foreground">
                  Tổng số đánh giá: <span className="font-semibold text-foreground">{totalReviews}</span>
                </p>
              </div>
            )}

            {/* Action buttons */}
            <div className="flex gap-3">
              <Button 
                onClick={calculateAverage} 
                className="flex-1 h-12 bg-primary hover:bg-primary/90 text-primary-foreground"
                disabled={totalReviews === 0}
              >
                <Calculator className="w-5 h-5 mr-2" />
                Tính Trung Bình
              </Button>
              <Button 
                variant="outline" 
                onClick={resetForm}
                disabled={totalReviews === 0 && average === null}
                className="h-12 border-border text-foreground hover:bg-accent"
              >
                Đặt Lại
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Phần hiển thị kết quả và tính số đánh giá 5 sao cần thiết */}
        <div className="space-y-6"> {/* Container for the right column cards */}
          {average !== null && (
            <Card className="border-primary/20 bg-primary/5 shadow-md">
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    {renderStars(Math.round(average))}
                  </div>
                  <p className="text-4xl font-bold text-primary mb-1">
                    {average.toFixed(1)}
                  </p>
                  <p className="text-base text-muted-foreground">
                    Điểm trung bình từ {totalReviews} đánh giá
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          <Card className="shadow-lg border-border bg-card"> {/* Removed conditional rendering for this card */}
            <CardHeader className="pb-4 px-6">
              <CardTitle className="flex items-center gap-2 text-lg leading-tight text-foreground">
                <Target className="w-5 h-5" />
                Số lượng đánh giá 5⭐ cần thêm để đạt mục tiêu
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-6 px-6">
              {average === null || totalReviews === 0 ? (
                <div className="text-center text-muted-foreground py-4">
                  Vui lòng nhập số lượng đánh giá và nhấn "Tính Trung Bình" để xem kết quả.
                </div>
              ) : (
                targets.map(({ rating, display, icon }) => {
                  const needed = calculateFiveStarsNeeded(rating);
                  const currentAverage = average || 0;
                  const isAchieved = currentAverage >= rating;
                  
                  return (
                    <div key={rating} className={`p-4 rounded-lg border ${
                      isAchieved 
                        ? 'bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800' 
                        : 'bg-muted border-border'
                    }`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-xl font-semibold text-foreground">{icon}</span>
                          <div>
                            <p className="font-medium text-foreground">Đạt {display} sao</p>
                          </div>
                        </div>
                        <div className="text-right">
                          {isAchieved ? (
                            <div className="flex items-center gap-1 text-green-600 dark:text-green-400">
                              <span className="font-bold text-base">✓ Đã đạt</span>
                            </div>
                          ) : (
                            <div>
                              <p className="text-xl font-bold text-primary">
                                Cần {needed} đánh giá 5⭐
                              </p>
                              <p className="text-sm text-muted-foreground">
                                để lên được {display} sao
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