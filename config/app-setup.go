package config

import "context"

type ApplicationSettings struct {
	ctx context.Context
}

func NewApplicationSettings() *ApplicationSettings {
	return &ApplicationSettings{}
}

func (a *ApplicationSettings) SetContext(ctx context.Context) {
	a.ctx = ctx
}
