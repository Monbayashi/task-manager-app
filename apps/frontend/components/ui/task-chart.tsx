/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { ArcElement, ChartData, ChartDataset, Chart as ChartJS, ChartOptions, Legend, Tooltip } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend);

const STATUS_COLOR = {
  todo: '#05df72',
  doing: '#fdc700',
  done: '#c27aff',
} as const;

const STATUS_TEXT = {
  todo: '未着手',
  doing: '進行中',
  done: '完了',
};

// 型定義（完璧）
interface TaskStatus {
  label: 'todo' | 'doing' | 'done';
  value: number;
}

type TaskStatusDonutChartProps = {
  statusList: TaskStatus[];
};

/**
 * タスクステータスチャート
 */
export const TaskStatusDonutChart = (props: TaskStatusDonutChartProps) => {
  const labels = props.statusList.map((item) => item.label);
  const data = props.statusList.map((item) => item.value);
  const backgroundColor = props.statusList.map((item) => STATUS_COLOR[item.label]);

  // データ
  const chartData: ChartData<'doughnut'> = {
    labels,
    datasets: [
      {
        data,
        backgroundColor,
        borderColor: '#ffffff',
        borderWidth: 5,
        cutout: '75%' as any,
        borderRadius: 8,
      } as ChartDataset<'doughnut'>,
    ],
  };

  // オプション
  const chartOptions: ChartOptions<'doughnut'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: { enabled: true },
    },
  };

  // 中央に総数だけ表示（シンプル・完璧）
  const centerTextPlugin = {
    id: 'centerText',
    afterDatasetsDraw(chart: any) {
      const currentData = chart.data.datasets[0].data as number[];
      const currentTotal = currentData.reduce((a: number, b: number) => a + b, 0);
      const {
        ctx,
        chartArea: { width, height },
      } = chart;
      ctx.save();
      ctx.font = 'bold 48px sans-serif';
      ctx.fillStyle = '#1f2937';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(currentTotal.toString(), width / 2, height / 2 - 10);

      ctx.font = '16px sans-serif';
      ctx.fillStyle = '#6b7280';
      ctx.fillText('総タスク数', width / 2, height / 2 + 20);
      ctx.restore();
    },
  };

  return (
    <div className="h-80 w-full bg-white px-2 pt-5">
      {/* ドーナツチャート */}
      <div className="h-52">
        <Doughnut data={chartData} options={chartOptions} plugins={[centerTextPlugin]} />
      </div>

      {/* 下にシンプルなリスト（絶対切れない！！） */}
      <div className="mt-2 grid grid-cols-3 gap-4 text-center">
        {props.statusList.map((item) => (
          <div key={item.label}>
            <div className="text-2xl font-bold" style={{ color: STATUS_COLOR[item.label] }}>
              {item.value}
            </div>
            <div className="text-base text-gray-600 capitalize">{STATUS_TEXT[item.label]}</div>
          </div>
        ))}
      </div>
    </div>
  );
};
