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

func (a ApplicationSettings) GetProxyServiceProtocols() map[string]string {
	return AvailableProxyProtocols()
}

func (a ApplicationSettings) GetCurrentProxySetting() *ProxyConfig {
	if ApplicationSetup == nil {
		return nil
	}
	oldPass := ApplicationSetup.ProxyConfig.GetPassword()
	return &ProxyConfig{
		UseProxy: ApplicationSetup.ProxyConfig.UseProxy,
		Protocol: ApplicationSetup.ProxyConfig.Protocol,
		Host:     ApplicationSetup.ProxyConfig.Host,
		Port:     ApplicationSetup.ProxyConfig.Port,
		User:     ApplicationSetup.ProxyConfig.User,
		Password: &oldPass,
	}
}

func (a ApplicationSettings) SaveNewProxySetting(use bool, protocol string, host string, port int, usernamem, password string) bool {
	if ApplicationSetup == nil {
		return false
	}
	ApplicationSetup.ProxyConfig = &ProxyConfig{
		UseProxy: use,
		Protocol: ProxyProtocol(protocol),
		Host:     host,
		Port:     &port,
		User:     &usernamem,
	}
	if password != "" {
		err := ApplicationSetup.ProxyConfig.SetPassword(password)
		if err != nil {
			return false
		}
	}
	err := ApplicationSetup.Save()
	if err != nil {
		return false
	}
	ApplicationSetup = LoadConfiguration()
	return true
}
