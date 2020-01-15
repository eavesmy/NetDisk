package lib

import (
	"../model"
	"crypto/md5"
	"encoding/json"
	"fmt"
	"io/ioutil"
	"os"
)

var db = []model.Assets{}

func DbInit(c *model.Config) {

	locationInit(c.DB, c.Location)

	writeDb(c.DB)
}

func locationInit(db_path, path string) {

	if _, err := os.Stat(db_path); os.IsNotExist(err) {
		f, err := os.Create(db_path)
		if err != nil {
			fmt.Println("create false", err)
		}
		f.Close()
	}

	dir, err := ioutil.ReadDir(path)

	if err != nil {
		fmt.Println(err)
	}

	rangeDir(dir, path)
}

func rangeDir(dir []os.FileInfo, path string) {
	for _, fi := range dir {
		if fi.IsDir() {
			d, _ := ioutil.ReadDir(path + "/" + fi.Name())
			rangeDir(d, path+"/"+fi.Name())
		} else {
			initFile(fi, path)
		}
	}
}

func initFile(f os.FileInfo, path string) {

	asset := &model.Assets{
		FileName:   f.Name(),
		LastModify: f.ModTime(),
		Size:       f.Size(),
		Path:       path,
	}

	db = append(db, *asset)
}

func writeDb(db_path string) {

	fi, err := os.OpenFile(db_path, os.O_WRONLY|os.O_TRUNC, 0600)

	if err != nil {
		fmt.Println(err)
	}

	defer fi.Close()

	for _, asset := range db {

		b, err := json.Marshal(asset)

		if err != nil {
			fmt.Println(err)
			continue
		}

		uni := Md5(b)
		line := append(uni, []byte(",")...)
		line = append(line, b...)
		line = append(line, []byte("\n")...)

		_, err = fi.Write(line)

		if err != nil {
			fmt.Println(err)
		}
	}
}

func Md5(b []byte) []byte {
	h := md5.New()
	h.Write(b)
	return h.Sum(nil)
}
