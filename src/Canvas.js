import React, { useState, useRef, useEffect } from "react";
import {
  Stage,
  Layer,
  Line,
  Rect,
  Circle,
  RegularPolygon,
} from "react-konva";
import { circleColors, lineColors, mockLineData } from "./utils";
import Select from "react-select";

const Canvas = () => {
  const [shapes, setShapes] = useState([]);
  const [tool, setTool] = useState("");  
  const [undoHistory, setUndoHistory] = useState([]);
  const [drawing, setDrawing] = useState(false);
  const [currentLine, setCurrentLine] = useState([]);
  const stageRef = useRef(null);
  const shapeRef = useRef(null);
  const [lineColor, setLineColor] = useState("black");

  useEffect(() => {
    const stage = stageRef.current.getStage();
    if (drawing) {
      stage.container().style.cursor = "crosshair";
    } else {
      stage.container().style.cursor = "default";
    }
  }, [drawing]);

  const getStyle = () => {
    switch (tool) {
      case "dashed":
        return {
          stroke: lineColor,
          strokeWidth: 2,
          dash: [10, 5],
          lineCap: "round",
          isLine: true,
        };
      case "dotted":
        return {
          stroke: lineColor,
          strokeWidth: 2,
          dash: [3, 3],
          lineCap: "round",
          isLine: true,
        };
      default:
        return {
          stroke: lineColor,
          strokeWidth: 2,
          lineCap: "round",
          isLine: true,
        };
    }
  };

  const handleMouseDown = () => {
    if (tool) {
      setDrawing(true);
      setCurrentLine([]);
    }
  };

  const handleMouseMove = (e) => {
    if (tool) {
      if (!drawing) {
        return;
      }
      const pos = e.target.getStage().getPointerPosition();
      setCurrentLine((line) => [...line, pos.x, pos.y]);
    }
  };

  const handleMouseUp = () => {
    if (tool) {
      setDrawing(false);
      setShapes((shapes) => [
        ...shapes,
        { points: currentLine, style: { ...getStyle() } },
      ]);
      setCurrentLine([]);
    }
  };

  const handleAddShape = (shapeType, shapeColor = "white") => {
    switch (shapeType) {
      case "rectangle":
        setShapes([
          ...shapes,
          {
            type: "rectangle",
            x: 50,
            y: 50,
            width: 50,
            height: 50,
            isShape: true,
          },
        ]);
        setUndoHistory([...undoHistory, [...shapes]]);
        break;
      case "circle":
        setShapes([
          ...shapes,
          {
            type: "circle",
            x: 50,
            y: 50,
            radius: 25,
            fill: shapeColor,
            isShape: true,
          },
        ]);
        setUndoHistory([...undoHistory, [...shapes]]);
        break;
      case "triangle":
        setShapes([
          ...shapes,
          { type: "triangle", x: 50, y: 50, radius: 40, isShape: true },
        ]);
        setUndoHistory([...undoHistory, [...shapes]]);
        break;
      default:
        break;
    }
  };

  const handleShapeDragEnd = (e) => {
    const updatedShapes = [...shapes];
    updatedShapes[e.target.index].x = e.target.x();
    updatedShapes[e.target.index].y = e.target.y();
    setShapes(updatedShapes);
    setUndoHistory([...undoHistory, [...shapes]]);
  };

  const handleUndo = () => {
    let temp = [...shapes];
    temp.pop();
    setShapes(temp);
  };

  const handleSolidLine = () => {
    setTool("solid");
  };

  const handleDashedLine = () => {
    setTool("dashed");
  };

  const handleDottedLine = () => {
    setTool("dotted");
  };

  const renderShapes = (shape, i) => {
    switch (shape.type) {
      case "rectangle":
        return (
          <Rect
            key={i}
            x={shape.x}
            y={shape.y}
            width={shape.width}
            height={shape.height}
            fill="white"
            stroke="black"
            strokeWidth={1}
            draggable={true}
            ref={shapeRef}
            onDragEnd={handleShapeDragEnd}
            onClick={() => setTool("")}
            style={{
              cursor: "pointer",
            }}
            dragBoundFunc={dragBoundFunc}
          />
        );
      case "circle":
        return (
          <Circle
            key={i}
            x={shape.x}
            y={shape.y}
            radius={shape.radius}
            fill={shape.fill}
            stroke="black"
            strokeWidth={1}
            draggable={true}
            ref={shapeRef}
            onDragEnd={handleShapeDragEnd}
            onClick={() => setTool("")}
            dragBoundFunc={dragBoundFunc}
          />
        );
      case "triangle":
        return (
          <RegularPolygon
            key={i}
            x={shape.x}
            y={shape.y}
            sides={3}
            fill="white"
            stroke="black"
            strokeWidth={1}
            radius={35}
            draggable={true}
            ref={shapeRef}
            onDragEnd={handleShapeDragEnd}
            onClick={() => setTool("")}
            dragBoundFunc={dragBoundFunc}
          />
        );

      default:
        return null;
    }
  };

  const dragBoundFunc = (pos) => {
    const stage = stageRef.current.getStage();
    const shape = shapeRef.current;
    const shapeSize = {
      width: shape.width(),
      height: shape.height(),
    };
    const minX = shapeSize.width / 2;
    const maxX = stage.width() - shapeSize.width / 2;
    const minY = shapeSize.height / 2;
    const maxY = stage.height() - shapeSize.height / 2;
    const x = Math.max(minX, Math.min(pos.x, maxX));
    const y = Math.max(minY, Math.min(pos.y, maxY));

    return {
      x,
      y,
    };
  };

  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
        }}
      >
        {circleColors.map((value, i) => (
          <div
            style={{
              borderRadius: "50%",
              backgroundColor: value,
              height: "50px",
              width: "50px",
            }}
            onClick={() => {
              handleAddShape("circle", value);
              setTool("");
            }}
          ></div>
        ))}
        <button
          onClick={() => {
            handleAddShape("rectangle", "white");
            setTool("");
          }}
        >
          Add Rectangle
        </button>
        <button
          onClick={() => {
            handleAddShape("triangle", "white");
            setTool("");
          }}
        >
          Add Triangle
        </button>
        <button onClick={handleSolidLine}>Solid Line</button>
        <button onClick={handleDashedLine}>Dashed Line</button>
        <button onClick={handleDottedLine}>Dotted Line</button>
        <button onClick={handleUndo}>Undo</button>
        <label>Line Color</label>
        <Select options={lineColors} onChange={(e) => setLineColor(e.value)} />
      </div>

    
        <Stage
          height={window.innerHeight*10}
          width={window.innerWidth}
          ref={stageRef}
          className="main_canvas"
          onMouseDown={handleMouseDown}
          onMousemove={handleMouseMove}
          onMouseup={handleMouseUp}
          style={{
            border: "1px solid"
          }}
        >
          <Layer>
            {shapes.map((line, i) =>
              line?.style?.isLine ? (
                <Line
                  key={i}
                  points={line.points}
                  stroke={line.style.stroke}
                  strokeWidth={line.style.strokeWidth}
                  dash={line.style.dash}
                  lineCap={line.style.lineCap}
                />
              ) : null
            )}
            {currentLine.length > 0 && (
              <Line
                points={currentLine}
                stroke={getStyle().stroke}
                strokeWidth={getStyle().strokeWidth}
                dash={getStyle().dash}
                lineCap={getStyle().lineCap}
              />
            )}
            {shapes.map((shape, i) => {
              return shape?.isShape ? renderShapes(shape, i) : null;
            })}
          </Layer>
        </Stage>
    
      <div></div>
    </div>
  );
};

export default Canvas;
