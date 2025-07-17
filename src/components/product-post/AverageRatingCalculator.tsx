import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Star, Calculator, RefreshCcw } from 'lucide-react';
import { cn } from '@/lib/utils';

const formSchema = z.object({
  fiveStar: z.coerce.number().int().min(0, 'Số lượng phải >= 0').default(0),
  fourStar: z.coerce.number().int().min(0, 'Số lượng phải >= 0').default(0),
  threeStar: z.coerce.number().int().min(0, 'Số lượng phải >= 0').default(0),
  twoStar: z.coerce.number().int().min(0, 'Số lượng phải >= 0').default(0),
  oneStar: z.coerce.number().int().min(0, 'Số lượng phải >= 0').default(0),
});

type RatingFormData = z.infer<typeof formSchema>;

const AverageRatingCalculator: React.FC = () => {
  const form = useForm<RatingFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fiveStar: 0,
      fourStar: 0,
      threeStar: 0,
      twoStar: 0,
      oneStar: 0,
    },
  });

  const { reset } = form;

  // State để lưu trữ kết quả tính toán
  const [calculatedTotalReviews, setCalculatedTotalReviews] = useState(0);
  const [calculatedAverageRating, setCalculatedAverageRating] = useState(0);

  const handleCalculate = () => {
    const currentValues = form.getValues(); // Lấy tất cả giá trị hiện tại từ form
    
    // Đảm bảo các giá trị là số, nếu không hợp lệ (NaN) thì mặc định là 0
    const currentFiveStar = Number(currentValues.fiveStar) || 0;
    const currentFourStar = Number(currentValues.fourStar) || 0;
    const currentThreeStar = Number(currentValues.threeStar) || 0;
    const currentTwoStar = Number(currentValues.twoStar) || 0;
    const currentOneStar = Number(currentValues.oneStar) || 0;

    const newTotalReviews = currentFiveStar + currentFourStar + currentThreeStar + currentTwoStar + currentOneStar;
    const newWeightedSum = (5 * currentFiveStar) + (4 * currentFourStar) + (3 * currentThreeStar) + (2 * currentTwoStar) + (1 * currentOneStar);
    const newAverageRating = newTotalReviews > 0 ? (newWeightedSum / newTotalReviews) : 0;

    setCalculatedTotalReviews(newTotalReviews);
    setCalculatedAverageRating(newAverageRating);
  };

  const handleClear = () => {
    reset(); // Đặt lại form về giá trị mặc định
    setCalculatedTotalReviews(0); // Đặt lại kết quả tính toán
    setCalculatedAverageRating(0); // Đặt lại kết quả tính toán
  };

  return (
    <Card className="shadow-lg border-border bg-card">
      <CardHeader className="border-b border-border pb-4">
        <CardTitle className="text-xl font-semibold text-card-foreground flex items-center gap-2">
          <Calculator className="w-5 h-5 text-primary" />
          Công Cụ Tính Điểm Đánh Giá Trung Bình
        </CardTitle>
        <CardDescription className="mt-1 text-sm text-muted-foreground">
          Nhập số lượng đánh giá cho từng mức sao và nhấn "Tính" để xem kết quả.
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        <Form {...form}>
          <form className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {[5, 4, 3, 2, 1].map((star) => (
              <FormField
                key={star}
                control={form.control}
                name={`${star}Star` as keyof RatingFormData}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-foreground flex items-center gap-1">
                      {star} <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="0"
                        placeholder="0"
                        {...field}
                        // Hiển thị chuỗi rỗng nếu giá trị là 0 để người dùng dễ nhập
                        value={field.value === 0 ? '' : field.value}
                        // Khi giá trị thay đổi, cập nhật vào form state. Zod sẽ xử lý ép kiểu.
                        onChange={(e) => field.onChange(e.target.value)}
                        className="bg-background border-border text-foreground"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            ))}
          </form>
        </Form>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-border">
          <div className="space-y-2">
            <Label className="text-foreground">Tổng số đánh giá</Label>
            <div className="text-2xl font-bold text-primary">{calculatedTotalReviews}</div> {/* Hiển thị từ state */}
          </div>
          <div className="space-y-2">
            <Label className="text-foreground">Điểm trung bình</Label>
            <div className="text-2xl font-bold text-primary">
              {calculatedAverageRating.toFixed(2)} <span className="text-yellow-400">★</span> {/* Hiển thị từ state */}
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button onClick={handleCalculate} className="bg-primary text-primary-foreground hover:bg-primary/90">
            <Calculator className="w-4 h-4 mr-2" />
            Tính
          </Button>
          <Button variant="outline" onClick={handleClear} className="border-border text-foreground hover:bg-accent">
            <RefreshCcw className="w-4 h-4 mr-2" />
            Xóa
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default AverageRatingCalculator;