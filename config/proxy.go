package config

import (
	"archgrid.xyz/ag/toolsbox/encryption/spiral"
	"gopkg.in/yaml.v3"
)

type ProxyProtocol string

const (
	ProtocolHttp   ProxyProtocol = "http"
	ProtocolHttps  ProxyProtocol = "https"
	ProtocolSocks5 ProxyProtocol = "socks5"
)

type ProxyConfig struct {
	UseProxy bool          `yaml:"use_proxy"`
	Protocol ProxyProtocol `yaml:"protocol"`
	Host     string        `yaml:"host"`
	Port     *int          `yaml:"port,omitempty"`
	User     *string       `yaml:"user,omitempty"`
	Password *string       `yaml:"password,omitempty"`
}

func AvailableProxyProtocols() map[string]string {
	return map[string]string{
		"HTTP":   string(ProtocolHttp),
		"HTTPS":  string(ProtocolHttps),
		"Socks5": string(ProtocolSocks5),
	}
}

func LoadProxyConfig(configContent []byte) *ProxyConfig {
	var proxyConfig ProxyConfig
	err := yaml.Unmarshal(configContent, &proxyConfig)
	if err != nil {
		return nil
	}
	return &proxyConfig
}

func (p *ProxyConfig) IsAvailable() bool {
	return p != nil && p.Protocol != "" && p.Host != ""
}

func (p *ProxyConfig) GetPassword() string {
	if p.Password == nil {
		return ""
	}
	deciphered, err := spiral.Decrypt(*p.Password)
	if err != nil {
		return ""
	}
	return deciphered
}

func (p *ProxyConfig) SetPassword(plainPassword string) error {
	ciphered, err := spiral.Encrypt(plainPassword)
	if err != nil {
		return err
	}
	p.Password = &ciphered
	return nil
}
