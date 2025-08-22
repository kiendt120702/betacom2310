export const formatLearningTime = (minutes: number): string => {
  if (minutes < 60) {
    return `${Math.round(minutes)}m`;
  }
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = Math.round(minutes % 60);
  return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
};

export const getStreakMessage = (streak: number): string => {
  if (streak === 0) return "Hãy bắt đầu streak!";
  if (streak < 3) return "Khởi đầu tốt!";
  if (streak < 7) return "Đang tiến bộ!";
  if (streak < 14) return "Tuyệt vời!";
  if (streak < 30) return "Xuất sắc!";
  return "Huyền thoại!";
};

export const getLearningLevel = (totalMinutes: number) => {
  const levels = [
    { level: 1, name: "Người mới", minMinutes: 0, maxMinutes: 60 },
    { level: 2, name: "Học viên", minMinutes: 60, maxMinutes: 300 },
    { level: 3, name: "Tích cực", minMinutes: 300, maxMinutes: 900 },
    { level: 4, name: "Chuyên cần", minMinutes: 900, maxMinutes: 1800 },
    { level: 5, name: "Thành thạo", minMinutes: 1800, maxMinutes: 3600 },
    { level: 6, name: "Chuyên gia", minMinutes: 3600, maxMinutes: Infinity },
  ];

  const currentLevel = levels.find(l => totalMinutes >= l.minMinutes && totalMinutes < l.maxMinutes) || levels[levels.length - 1];
  const progress = currentLevel.maxMinutes === Infinity 
    ? 100 
    : Math.min(100, ((totalMinutes - currentLevel.minMinutes) / (currentLevel.maxMinutes - currentLevel.minMinutes)) * 100);

  return {
    level: currentLevel.level,
    name: currentLevel.name,
    progress: Math.round(progress)
  };
};