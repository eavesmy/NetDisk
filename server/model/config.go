package model

type Config struct {
	Location string `json:"location"`
	Ucloud   string `json:"ucloud"`
	Mysql    string `json:"mysql"`
	DB       string `json:"db"`
	Download string `json:"download"`
}

func NewConfig() *Config {
	return &Config{
		Location: "./",
		DB:       ".enetdiskfiledb",
	}
}
