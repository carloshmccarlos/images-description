export const profileTranslations = {
  en: {
    header: {
      learning: 'Learning',
      native: 'Native',
      level: 'Level',
      memberSince: 'Member Since',
    },
    stats: {
      wordsLearned: 'Words Learned',
      totalAnalyses: 'Total Analyses',
      currentStreak: 'Current Streak',
      longestStreak: 'Longest Streak',
      savedAnalyses: 'Saved Analyses',
    },
    levels: {
      beginner: 'Beginner',
      intermediate: 'Intermediate',
      advanced: 'Advanced',
    },
    progress: {
      title: 'Learning Progress',
      thisWeek: 'This Week',
      wordsPerDay: 'words/day',
    },
    achievements: {
      title: 'Achievements',
      locked: 'Locked',
      unlocked: 'Unlocked',
    },
  },
  zh: {
    header: {
      learning: '正在学习',
      native: '母语',
      level: '等级',
      memberSince: '加入时间',
    },
    stats: {
      wordsLearned: '已学单词',
      totalAnalyses: '总分析次数',
      currentStreak: '当前连续',
      longestStreak: '最长连续',
      savedAnalyses: '已保存分析',
    },
    levels: {
      beginner: '初学者',
      intermediate: '中级',
      advanced: '高级',
    },
    progress: {
      title: '学习进度',
      thisWeek: '本周',
      wordsPerDay: '单词/天',
    },
    achievements: {
      title: '成就',
      locked: '未解锁',
      unlocked: '已解锁',
    },
  },
  ja: {
    header: {
      learning: '学習中',
      native: '母国語',
      level: 'レベル',
      memberSince: '登録日',
    },
    stats: {
      wordsLearned: '学習した単語',
      totalAnalyses: '総分析回数',
      currentStreak: '現在の連続',
      longestStreak: '最長連続',
      savedAnalyses: '保存した分析',
    },
    levels: {
      beginner: '初級',
      intermediate: '中級',
      advanced: '上級',
    },
    progress: {
      title: '学習進捗',
      thisWeek: '今週',
      wordsPerDay: '単語/日',
    },
    achievements: {
      title: '実績',
      locked: 'ロック中',
      unlocked: '解除済み',
    },
  },
  ko: {
    header: {
      learning: '학습 중',
      native: '모국어',
      level: '레벨',
      memberSince: '가입일',
    },
    stats: {
      wordsLearned: '학습한 단어',
      totalAnalyses: '총 분석 횟수',
      currentStreak: '현재 연속',
      longestStreak: '최장 연속',
      savedAnalyses: '저장된 분석',
    },
    levels: {
      beginner: '초급',
      intermediate: '중급',
      advanced: '고급',
    },
    progress: {
      title: '학습 진행 상황',
      thisWeek: '이번 주',
      wordsPerDay: '단어/일',
    },
    achievements: {
      title: '업적',
      locked: '잠김',
      unlocked: '해제됨',
    },
  },
} as const;

export type ProfileTranslations = typeof profileTranslations.en;
