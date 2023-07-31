package remote

import (
	"context"

	"github.com/wailsapp/wails/v2/pkg/runtime"
)

type DownloadEvent struct {
	ctx           context.Context
	EventId       string
	TotalLength   uint64
	currentLength uint64
}

func (e DownloadEvent) Start() {
	runtime.EventsEmit(e.ctx, e.EventId, map[string]any{"state": "start"})
}

func (e *DownloadEvent) Progress() {
	runtime.EventsEmit(e.ctx, e.EventId, map[string]any{"state": "progress", "completed": e.currentLength, "total": e.TotalLength})
}

func (e DownloadEvent) Finish() {
	runtime.EventsEmit(e.ctx, e.EventId, map[string]any{"state": "finish"})
}

func (e DownloadEvent) Failed(err error) {
	runtime.EventsEmit(e.ctx, e.EventId, map[string]any{"state": "failed", "error": err.Error()})
}

func (e *DownloadEvent) Write(buf []byte) (int, error) {
	n := len(buf)
	e.currentLength += uint64(n)
	e.Progress()
	return n, nil
}
