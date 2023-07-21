import { EventEmitter } from 'events';
import { createContext } from 'react';

export const eventBus = new EventEmitter();
export const EventBusContext = createContext<EventEmitter>(eventBus);
