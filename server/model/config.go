package model

type Config struct {
	Location string `json:"location"`
	Ucloud   string `json:"ucloud"`
	Mysql    string `json:"mysql"`
	DB       string `json:"db"`
	Download string `json:"download"`
	Id       string `json:"id"`
	Secret   string `json:"secret"`
}

func NewConfig() *Config {
	return &Config{
		Location: "./",
		DB:       ".enetdiskfiledb",
	}
}
