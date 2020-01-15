package model

import "time"

type Assets struct {
	FileName   string
	LastModify time.Time
	Size       int64
	Type       string
	Path       string
}
