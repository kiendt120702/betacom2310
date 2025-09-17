import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useEduExercises } from '@/hooks/useEduExercises';
import { useUpdateExerciseOrder } from '@/hooks/useUpdateExerciseOrder';
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Loader2 } from 'lucide-react';
import { TrainingExercise } from '@/types/training';

// SortableItem component
const SortableItem = ({ id, title, index }: { id: string; title: string; index: number }) => {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };
  return (
    <div ref={setNodeRef} style={style} {...attributes} className="flex items-center p-3 bg-muted/50 rounded-lg border transition-shadow hover:shadow-sm">
      <div {...listeners} className="cursor-grab p-1">
        <GripVertical className="h-5 w-5 text-muted-foreground" />
      </div>
      <span className="ml-2 font-medium">{index + 1}. {title}</span>
    </div>
  );
};

// Main Dialog component
const ReorderExercisesDialog = ({ open, onClose }: { open: boolean; onClose: () => void }) => {
  const { data: exercises = [], isLoading } = useEduExercises();
  const [orderedExercises, setOrderedExercises] = useState<TrainingExercise[]>([]);
  const updateOrderMutation = useUpdateExerciseOrder();

  useEffect(() => {
    if (exercises) {
      setOrderedExercises([...exercises].sort((a, b) => a.order_index - b.order_index));
    }
  }, [exercises, open]);

  const sensors = useSensors(useSensor(PointerSensor));

  const handleDragEnd = (event: { active: any; over: any; }) => {
    const { active, over } = event;
    if (active.id !== over.id) {
      setOrderedExercises((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const handleSaveOrder = () => {
    const exercisesToUpdate = orderedExercises.map((exercise, index) => ({
      id: exercise.id,
      order_index: index + 1,
    }));
    updateOrderMutation.mutate(exercisesToUpdate, {
      onSuccess: () => onClose(),
    });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Sắp xếp thứ tự bài học</DialogTitle>
          <DialogDescription>Kéo và thả để thay đổi thứ tự các bài học.</DialogDescription>
        </DialogHeader>
        <div className="max-h-[60vh] overflow-y-auto p-1 pr-4 -mr-4">
          {isLoading ? (
            <div className="flex justify-center items-center h-48">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : (
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <SortableContext items={orderedExercises.map(e => e.id)} strategy={verticalListSortingStrategy}>
                <div className="space-y-2">
                  {orderedExercises.map((exercise, index) => (
                    <SortableItem key={exercise.id} id={exercise.id} title={exercise.title} index={index} />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Hủy</Button>
          <Button onClick={handleSaveOrder} disabled={updateOrderMutation.isPending}>
            {updateOrderMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Lưu thứ tự
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ReorderExercisesDialog;