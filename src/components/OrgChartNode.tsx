import React from 'react';
import { cn } from '@/lib/utils';

export interface OrgNode {
  title: string;
  name?: string;
  color: 'bod' | 'control' | 'department' | 'leader' | 'staff';
  children?: OrgNode[];
}

const OrgChartNode = ({ node }: { node: OrgNode }) => {
  const colorClasses = {
    bod: 'bg-sky-800 text-white',
    control: 'bg-orange-600 text-white',
    department: 'bg-orange-500 text-white',
    leader: 'bg-green-800 text-white',
    staff: 'bg-sky-500 text-white',
  };

  return (
    <div className="org-chart-node flex flex-col items-center">
      <div className={cn(
        "p-2 px-3 rounded-md shadow-md text-center min-w-[120px] max-w-[200px]",
        colorClasses[node.color]
      )}>
        <div className="font-bold text-sm whitespace-pre-wrap">{node.title}</div>
        {node.name && <div className="text-xs mt-1 whitespace-pre-wrap">{node.name}</div>}
      </div>
      {node.children && node.children.length > 0 && (
        <div className="org-chart-children flex justify-center gap-x-4 pt-8">
          {node.children.map((child, index) => (
            <OrgChartNode key={index} node={child} />
          ))}
        </div>
      )}
    </div>
  );
};

export default OrgChartNode;