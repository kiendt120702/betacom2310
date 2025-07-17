
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
        className={`w-4 h-4 ${
          index < count 
            ? 'fill-yellow-400 text-yellow-400' 
            : 'text-gray-300'
        }`}
      />
    ));
  };

  const totalReviews = Object.values(ratings).reduce((sum, value) => sum + (parseInt(value) || 0), 0);

  const targets = [
    { rating: 4.76, display: '4.8', icon: '4.8⭐' },
    { rating: 4.86, display: '4.9', icon: '4.9⭐' },
    { rating: 4.96, display: '5.0', icon: '5.0⭐' }
  ];

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-foreground mb-2 flex items-center justify-center gap-2">
          <Calculator className="w-8 h-8" />
          Tính Trung Bình Đánh Giá
        </h1>
        <p className="text-muted-foreground">
          Nhập số lượng đánh giá cho từng mức sao để tính điểm trung bình và chiến lược nâng điểm
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Phần tính trung bình */}
        <Card>
          <CardHeader>
            <CardTitle>Nhập Số Lượng Đánh Giá</CardTitle>
            <CardDescription>
              Vui lòng nhập số lượng đánh giá tương ứng với từng mức sao
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Input fields for each star rating */}
            <div className="space-y-4">
              {[
                { key: 'fiveStar' as const, label: '5 sao', stars: 5 },
                { key: 'fourStar' as const, label: '4 sao', stars: 4 },
                { key: 'threeStar' as const, label: '3 sao', stars: 3 },
                { key: 'twoStar' as const, label: '2 sao', stars: 2 },
                { key: 'oneStar' as const, label: '1 sao', stars: 1 }
              ].map(({ key, label, stars }) => (
                <div key={key} className="flex items-center gap-4">
                  <div className="flex items-center gap-2 min-w-[120px]">
                    {renderStars(stars)}
                    <span className="text-sm font-medium">{label}</span>
                  </div>
                  <div className="flex-1">
                    <Input
                      type="text"
                      value={ratings[key]}
                      onChange={(e) => handleInputChange(key, e.target.value)}
                      placeholder="0"
                      className="text-center"
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Total reviews display */}
            {totalReviews > 0 && (
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground">
                  Tổng số đánh giá: <span className="font-semibold text-foreground">{totalReviews}</span>
                </p>
              </div>
            )}

            {/* Action buttons */}
            <div className="flex gap-3">
              <Button 
                onClick={calculateAverage} 
                className="flex-1"
                disabled={totalReviews === 0}
              >
                <Calculator className="w-4 h-4 mr-2" />
                Tính Trung Bình
              </Button>
              <Button 
                variant="outline" 
                onClick={resetForm}
                disabled={totalReviews === 0 && average === null}
              >
                Đặt Lại
              </Button>
            </div>

            {/* Result display */}
            {average !== null && (
              <Card className="border-primary/20 bg-primary/5">
                <CardContent className="pt-6">
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      {renderStars(Math.round(average))}
                    </div>
                    <p className="text-3xl font-bold text-primary mb-1">
                      {average.toFixed(1)}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Điểm trung bình từ {totalReviews} đánh giá
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </CardContent>
        </Card>

        {/* Phần tính số đánh giá 5 sao cần thiết */}
        {average !== null && totalReviews > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5" />
                Chiến Lược Nâng Điểm
              </CardTitle>
              <CardDescription>
                Số lượng đánh giá 5⭐ cần thêm để đạt mục tiêu
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {targets.map(({ rating, display, icon }) => {
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
                      <div className="flex items-center gap-3">
                        <span className="text-lg font-semibold">{icon}</span>
                        <div>
                          <p className="font-medium">Đạt {display} sao</p>
                          <p className="text-sm text-muted-foreground">
                            (Cần ≥ {rating.toFixed(2)} điểm)
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        {isAchieved ? (
                          <div className="flex items-center gap-1 text-green-600 dark:text-green-400">
                            <span className="font-bold">✓ Đã đạt</span>
                          </div>
                        ) : (
                          <div>
                            <p className="text-xl font-bold text-primary">
                              +{needed}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              đánh giá 5⭐
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
              
              <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
                <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                  💡 Lưu ý quan trọng:
                </h4>
                <ul className="text-sm text-blue-700 dark:text-blue-200 space-y-1">
                  <li>• Điểm 4.76 sẽ hiển thị là 4.8⭐ trên hầu hết platform</li>
                  <li>• Điểm 4.86 sẽ hiển thị là 4.9⭐ trên hầu hết platform</li>
                  <li>• Điểm 4.96 sẽ hiển thị là 5.0⭐ trên hầu hết platform</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Usage instructions */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-lg">Hướng Dẫn Sử Dụng</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>• Nhập số lượng đánh giá tương ứng với từng mức sao (1-5 sao)</li>
            <li>• Chỉ nhập số nguyên không âm (0, 1, 2, 3...)</li>
            <li>• Nhấn "Tính Trung Bình" để xem kết quả và chiến lược nâng điểm</li>
            <li>• Kết quả sẽ được làm tròn đến 1 chữ số thập phân</li>
            <li>• Phần "Chiến Lược Nâng Điểm" sẽ cho biết cần bao nhiêu đánh giá 5⭐ để đạt mục tiêu</li>
            <li>• Sử dụng "Đặt Lại" để xóa tất cả dữ liệu và bắt đầu lại</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};

export default AverageRatingPage;
