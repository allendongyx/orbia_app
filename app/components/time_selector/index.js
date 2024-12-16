import React, { useState } from "react";

function TimeTable() {
  const days = ["一", "二", "三", "四", "五", "六", "七"];
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

  return (
    <table className="time-table">
      <thead>
        <tr>
          <th rowSpan={2}>周/时间</th>
          <th colSpan={24}>00:00 - 12:00</th>
          <th colSpan={24}>12:00 - 24:00</th>
        </tr>
        <tr>
          {hoursHead.map((hour) => (
            <th colSpan={2} key={hour}>{hour}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {days.map((day) => (
          <tr key={day}>
            <td className="day-cell">{day}</td>
            {hours.map((hour) => {
              const cellId = `${day}-${hour}`;
              return (
                <td
                  key={hour}
                  className={`${selection.has(cellId) ? "selected" : ""} ${
                    previewSelection.has(cellId) ? "preview" : ""
                  }`}
                  onMouseDown={() => handleMouseDown(day, hour)}
                  onMouseEnter={() => handleMouseEnter(day, hour)}
                  onMouseUp={handleMouseUp}
                ></td>
              );
            })}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default TimeTable;
