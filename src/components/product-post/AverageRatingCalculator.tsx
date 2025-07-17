import React from 'react';
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

  const { watch, setValue, reset } = form;

  const fiveStar = watch('fiveStar');
  const fourStar = watch('fourStar');
  const threeStar = watch('threeStar');
  const twoStar = watch('twoStar');
  const oneStar = watch('oneStar');

  const totalReviews = fiveStar + fourStar + threeStar + twoStar + oneStar;
  const weightedSum = (5 * fiveStar) + (4 * fourStar) + (3 * threeStar) + (2 * twoStar) + (1 * oneStar);
  const averageRating = totalReviews > 0 ? (weightedSum / totalReviews) : 0;

  const handleClear = () => {
    reset();
  };

  return (
    <Card className="shadow-lg border-border bg-card">
      <CardHeader className="border-b border-border pb-4">
        <CardTitle className="text-xl font-semibold text-card-foreground flex items-center gap-2">
          <Calculator className="w-5 h-5 text-primary" />
          Công Cụ Tính Điểm Đánh Giá Trung Bình
        </CardTitle>
        <CardDescription className="mt-1 text-sm text-muted-foreground">
          Nhập số lượng đánh giá cho từng mức sao để tính điểm trung bình.
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
                        onChange={(e) => {
                          const value = parseInt(e.target.value, 10);
                          field.onChange(isNaN(value) ? 0 : value);
                        }}
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
            <div className="text-2xl font-bold text-primary">{totalReviews}</div>
          </div>
          <div className="space-y-2">
            <Label className="text-foreground">Điểm trung bình</Label>
            <div className="text-2xl font-bold text-primary">
              {averageRating.toFixed(2)} <span className="text-yellow-400">★</span>
            </div>
          </div>
        </div>

        <div className="flex justify-end">
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