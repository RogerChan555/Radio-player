"use client";

import * as React from "react";
import {
  closestCenter,
  defaultDropAnimationSideEffects,
  DndContext,
  DragOverlay,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  restrictToHorizontalAxis,
  restrictToParentElement,
  restrictToVerticalAxis,
} from "@dnd-kit/modifiers";
import {
  arrayMove,
  horizontalListSortingStrategy,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Slot } from "@radix-ui/react-slot";

import { composeRefs } from "@/lib/compose-refs";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const orientationConfig = {
  vertical: {
    modifiers: [restrictToVerticalAxis, restrictToParentElement],
    strategy: verticalListSortingStrategy,
  },
  horizontal: {
    modifiers: [restrictToHorizontalAxis, restrictToParentElement],
    strategy: horizontalListSortingStrategy,
  },
  mixed: {
    modifiers: [restrictToParentElement],
    strategy: undefined,
  },
};

function Sortable({
  value,
  onValueChange,
  collisionDetection = closestCenter,
  modifiers,
  strategy,
  onMove,
  orientation = "vertical",
  overlay,
  children,
  ...props
}) {
  const [activeId, setActiveId] = React.useState(null);
  const sensors = useSensors(
    useSensor(MouseSensor),
    useSensor(TouchSensor),
    useSensor(KeyboardSensor)
  );

  const config = orientationConfig[orientation];

  return (
    <DndContext
      modifiers={modifiers ?? config.modifiers}
      sensors={sensors}
      onDragStart={({ active }) => setActiveId(active.id)}
      onDragEnd={({ active, over }) => {
        if (over && active.id !== over?.id) {
          const activeIndex = value.findIndex((item) => item.id === active.id);
          const overIndex = value.findIndex((item) => item.id === over.id);

          if (onMove) {
            onMove({ activeIndex, overIndex });
          } else {
            onValueChange?.(arrayMove(value, activeIndex, overIndex));
          }
        }
        setActiveId(null);
      }}
      onDragCancel={() => setActiveId(null)}
      collisionDetection={collisionDetection}
      {...props}
    >
      <SortableContext items={value} strategy={strategy ?? config.strategy}>
        {children}
      </SortableContext>
      {overlay ? (
        <SortableOverlay activeId={activeId}>{overlay}</SortableOverlay>
      ) : null}
    </DndContext>
  );
}

const dropAnimationOpts = {
  sideEffects: defaultDropAnimationSideEffects({
    styles: {
      active: {
        opacity: "0.4",
      },
    },
  }),
};

const SortableOverlay = React.forwardRef(
  (
    { activeId, dropAnimation = dropAnimationOpts, children, ...props },
    ref
  ) => {
    return (
      <DragOverlay dropAnimation={dropAnimation} {...props}>
        {activeId ? (
          <SortableItem
            ref={ref}
            value={activeId}
            className="cursor-grabbing"
            asChild
          >
            {children}
          </SortableItem>
        ) : null}
      </DragOverlay>
    );
  }
);
SortableOverlay.displayName = "SortableOverlay";

const SortableItemContext = React.createContext({
  attributes: {},
  listeners: undefined,
  isDragging: false,
});

function useSortableItem() {
  const context = React.useContext(SortableItemContext);

  if (!context) {
    throw new Error("useSortableItem must be used within a SortableItem");
  }

  return context;
}

const SortableItem = React.forwardRef(
  ({ value, asTrigger, asChild, className, ...props }, ref) => {
    const {
      attributes,
      listeners,
      setNodeRef,
      transform,
      transition,
      isDragging,
    } = useSortable({ id: value });

    const context = React.useMemo(
      () => ({
        attributes,
        listeners,
        isDragging,
      }),
      [attributes, listeners, isDragging]
    );
    const style = {
      opacity: isDragging ? 0.5 : 1,
      transform: CSS.Translate.toString(transform),
      transition,
    };

    const Comp = asChild ? Slot : "div";

    return (
      <SortableItemContext.Provider value={context}>
        <Comp
          data-state={isDragging ? "dragging" : undefined}
          className={cn(
            "data-[state=dragging]:cursor-grabbing",
            { "cursor-grab": !isDragging && asTrigger },
            className
          )}
          ref={composeRefs(ref, setNodeRef)}
          style={style}
          {...(asTrigger ? attributes : {})}
          {...(asTrigger ? listeners : {})}
          {...props}
        />
      </SortableItemContext.Provider>
    );
  }
);
SortableItem.displayName = "SortableItem";

const SortableDragHandle = React.forwardRef(({ className, ...props }, ref) => {
  const { attributes, listeners, isDragging } = useSortableItem();

  return (
    <Button
      ref={composeRefs(ref)}
      data-state={isDragging ? "dragging" : undefined}
      className={cn(
        "cursor-grab data-[state=dragging]:cursor-grabbing",
        className
      )}
      {...attributes}
      {...listeners}
      {...props}
    />
  );
});
SortableDragHandle.displayName = "SortableDragHandle";

export { Sortable, SortableDragHandle, SortableItem, SortableOverlay };
