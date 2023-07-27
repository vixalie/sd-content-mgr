package models

import (
	"fmt"
	"strings"
)

func AssembleModelVersionUrl(versionId int) string {
	builder := strings.Builder{}
	builder.WriteString("https://civitai.com/api/v1/model-versions/")
	builder.WriteString(fmt.Sprintf("%d", versionId))
	return builder.String()
}

func AssembleModelUrl(modelId int) string {
	builder := strings.Builder{}
	builder.WriteString("https://civitai.com/api/v1/models/")
	builder.WriteString(fmt.Sprintf("%d", modelId))
	return builder.String()
}
