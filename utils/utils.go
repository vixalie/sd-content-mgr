package utils

import (
	"fmt"

	"archgrid.xyz/ag/toolsbox/serial_code/hail"
)

func GeneratePrefixedHailID(prefix string) (string, error) {
	hailEngine, err := hail.Get()
	if err != nil {
		return "", fmt.Errorf("未能获取有效的Hail ID发生器，%w", err)
	}
	return hailEngine.GeneratePrefixedString(prefix), nil
}
