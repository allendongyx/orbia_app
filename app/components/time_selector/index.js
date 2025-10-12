"use client";

import React, { useState } from "react";

function TimeTable() {
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const hoursHead = Array.from({ length: 24 }, (_, i) => i);

  // 每小时有两个单元格，分别代表一个小时的开始和半小时
  const hours = Array.from({ length: 24 * 2 }, (_, i) => {
    const hour = Math.floor(i / 2);
    const minute = i % 2 === 0 ? ":00" : ":30";
    return `${hour}${minute}`;
  });

  const [selection, setSelection] = useState(new Set());
  const [dragging, setDragging] = useState(false);
  const [startCell, setStartCell] = useState(null);
  const [endCell, setEndCell] = useState(null);
  const [previewSelection, setPreviewSelection] = useState(new Set());

  const toggleSelection = (id) => {
    const newSelection = new Set(selection);
    if (newSelection.has(id)) {
      newSelection.delete(id);
    } else {
      newSelection.add(id);
    }
    setSelection(newSelection);
  };

  const handleMouseDown = (day, hour) => {
    const id = `${day}-${hour}`;
    setDragging(true);
    setStartCell({ day, hour });
    setEndCell({ day, hour });
    setPreviewSelection(new Set()); // Clear preview on start
  };

  const handleMouseUp = () => {
    if (
      startCell &&
      endCell &&
      startCell.day === endCell.day &&
      startCell.hour === endCell.hour
    ) {
      // 单击操作：切换选中状态
      toggleSelection(`${startCell.day}-${startCell.hour}`);
      console.log(123);
    } else {
      const newSelection = new Set(selection); // 复制当前选中集合

      if (!dragging) {
        return;
      }

      // 判断拖拽的单元中包含的状态
      let hasSelected = false;
      let hasUnselected = false;

      previewSelection.forEach((id) => {
        if (selection.has(id)) {
          hasSelected = true;
        } else {
          hasUnselected = true;
        }
      });

      // 根据预览的选择情况进行操作
      if (hasSelected && hasUnselected) {
        // 如果混合，则变为全部选中
        previewSelection.forEach((id) => newSelection.add(id));
      } else if (hasSelected) {
        // 如果全部已选中，则取消选中
        previewSelection.forEach((id) => newSelection.delete(id));
      } else {
        // 如果都是未选中的，则全部选中
        previewSelection.forEach((id) => newSelection.add(id));
      }
      setSelection(newSelection); // 更新状态
    }

    setDragging(false);
    setPreviewSelection(new Set()); // 清空预览
  };

  const handleMouseEnter = (day, hour) => {
    if (!dragging) return;
    setEndCell({ day, hour });
    updatePreviewSelection(day, hour);
  };
  const updatePreviewSelection = (currentDay, currentHour) => {
    const newPreviewSelection = new Set();
    const starty = days.indexOf(startCell.day);
    const startx = hours.indexOf(startCell.hour);
    const endy = days.indexOf(currentDay);
    const endx = hours.indexOf(currentHour);

    const minX = Math.min(startx, endx);
    const maxX = Math.max(startx, endx);
    const minY = Math.min(starty, endy);
    const maxY = Math.max(starty, endy);

    for (let y = minY; y <= maxY; y++) {
      for (let x = minX; x <= maxX; x++) {
        newPreviewSelection.add(`${days[y]}-${hours[x]}`);
      }
    }
    setPreviewSelection(newPreviewSelection);
  };

  // 判断预览区域的操作类型
  const getPreviewAction = () => {
    if (previewSelection.size === 0) return 'none';
    
    let hasSelected = false;
    let hasUnselected = false;

    previewSelection.forEach((id) => {
      if (selection.has(id)) {
        hasSelected = true;
      } else {
        hasUnselected = true;
      }
    });

    if (hasSelected && hasUnselected) {
      return 'add'; // 混合状态，将全部选中
    } else if (hasSelected) {
      return 'remove'; // 全部已选中，将取消选中
    } else {
      return 'add'; // 都未选中，将全部选中
    }
  };

  return (
    <div className="w-full overflow-x-auto rounded-lg border border-gray-200 bg-white shadow-sm">
      <table className="w-full border-collapse">
        <thead>
          <tr>
            <th 
              rowSpan={2} 
              className="sticky left-0 z-20 bg-gradient-to-r from-gray-50 to-gray-100 border-b-2 border-r-2 border-gray-300 px-1.5 py-2 text-[10px] font-semibold text-gray-700 w-[45px]"
            >
              Day
            </th>
            <th 
              colSpan={24} 
              className="bg-gradient-to-r from-blue-50 to-blue-100 border-b border-r border-gray-300 px-2 py-2 text-xs font-semibold text-blue-900"
            >
              00:00 - 12:00
            </th>
            <th 
              colSpan={24} 
              className="bg-gradient-to-r from-purple-50 to-purple-100 border-b border-gray-300 px-2 py-2 text-xs font-semibold text-purple-900"
            >
              12:00 - 24:00
            </th>
          </tr>
          <tr>
            {hoursHead.map((hour) => (
              <th 
                colSpan={2} 
                key={hour}
                className="bg-gray-50 border-b-2 border-r border-gray-200 px-1 py-1.5 text-[10px] font-medium text-gray-600 min-w-[24px]"
              >
                {hour}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {days.map((day, dayIndex) => {
            const previewAction = getPreviewAction();
            
            return (
              <tr key={day} className="group hover:bg-gray-50/50 transition-colors">
                <td className="sticky left-0 z-10 bg-white group-hover:bg-gray-50 border-r-2 border-b border-gray-300 px-1.5 py-2 text-[10px] font-medium text-gray-700 text-center transition-colors w-[45px]">
                  {day}
                </td>
                {hours.map((hour, hourIndex) => {
                  const cellId = `${day}-${hour}`;
                  const isSelected = selection.has(cellId);
                  const isPreview = previewSelection.has(cellId);
                  
                  // 判断当前单元格的显示状态
                  let cellClassName = '';
                  if (isPreview && previewAction === 'remove') {
                    // 取消选择预览：浅灰色带斜纹效果，表示即将移除
                    cellClassName = 'bg-gray-300 hover:bg-gray-400 shadow-inner ring-1 ring-inset ring-gray-400';
                  } else if (isPreview && previewAction === 'add') {
                    // 添加选择预览：中灰色
                    cellClassName = 'bg-gray-500 hover:bg-gray-600 shadow-inner';
                  } else if (isSelected) {
                    // 已选中：深灰色
                    cellClassName = 'bg-gray-800 hover:bg-gray-900 shadow-inner';
                  } else {
                    // 未选中
                    cellClassName = 'bg-white hover:bg-gray-100';
                  }
                  
                  return (
                    <td
                      key={hour}
                      className={`
                        border-r border-b border-gray-200 cursor-pointer transition-all duration-150
                        ${hourIndex % 2 === 0 ? 'border-r-gray-300' : ''}
                        ${hourIndex === 23 ? 'border-r-2 border-r-gray-400' : ''}
                        ${cellClassName}
                      `}
                      style={{ width: '12px', height: '32px' }}
                      onMouseDown={() => handleMouseDown(day, hour)}
                      onMouseEnter={() => handleMouseEnter(day, hour)}
                      onMouseUp={handleMouseUp}
                    />
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
      
      {/* Legend */}
      <div className="flex items-center justify-between gap-4 border-t border-gray-200 bg-gray-50 px-4 py-3">
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-2">
            <div className="h-4 w-6 rounded border border-gray-300 bg-white"></div>
            <span className="text-gray-600">Available</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-4 w-6 rounded border border-gray-800 bg-gray-800"></div>
            <span className="text-gray-600">Selected</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-4 w-6 rounded border border-gray-500 bg-gray-500"></div>
            <span className="text-gray-600">Add Preview</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-4 w-6 rounded border-2 border-gray-400 bg-gray-300 ring-1 ring-inset ring-gray-400"></div>
            <span className="text-gray-600">Remove Preview</span>
          </div>
        </div>
        
        {selection.size > 0 && (
          <button
            onClick={() => setSelection(new Set())}
            className="text-xs font-medium text-red-600 hover:text-red-700 hover:underline transition-colors"
          >
            Clear Selection ({selection.size} slots)
          </button>
        )}
      </div>
    </div>
  );
}

export default TimeTable;
