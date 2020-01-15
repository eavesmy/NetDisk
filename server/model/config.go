package model

type Config struct {
	Location string `json:"location"`
	Ucloud   string `json:"ucloud"`
	Mysql    string `json:"mysql"`
	DB       string `json:"db"`
}

func NewConfig() *Config {
	return &Config{
		Location: "./",
		DB:       ".enetdiskfiledb",
	}
}
