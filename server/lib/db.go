package lib

import (
	"../model"
	"crypto/md5"
	"encoding/json"
	"fmt"
	"io/ioutil"
	"os"
	"strconv"
	"strings"
)

var downloadPath string
var db = []model.Assets{}
var root_path string

func DbInit(c *model.Config) {

	locationInit(c.DB, c.Location)
	root_path = c.Location
	downloadPath = c.Download

	writeDb(c.DB)

	fmt.Println("Init finished")
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
		initFile(fi, path)
		if fi.IsDir() {
			d, _ := ioutil.ReadDir(path + "/" + fi.Name())
			rangeDir(d, path+"/"+fi.Name())
		}
	}
}

func initFile(f os.FileInfo, path string) {

	asset := &model.Assets{
		FileName:   f.Name(),
		LastModify: f.ModTime(),
		Size:       f.Size(),
		IsDir:      f.IsDir(),
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

func GetByCondition(s_type, s_p string) []model.Assets {

	arr := []model.Assets{}

	for _, a := range db {

		if s_type != a.Type {
			continue
		}
		if s_p != a.Path {
			continue
		}
		arr = append(arr, a)
	}

	return arr
}

func GetDbInfo() map[string]string {

	total := 0
	for _, a := range db {
		if !a.IsDir {
			total++
		}
	}

	return map[string]string{
		"Total": strconv.Itoa(total),
		"Root":  root_path,
	}
}

func GetAsset(src string) string {
	return downloadPath + strings.Replace(src, root_path, "", 1)
}
