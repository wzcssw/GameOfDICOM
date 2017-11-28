package main

import (
	"MedicalBodyParts/lib"
	"net/http"

	"github.com/GeertJohan/go.rice" // 静态文件服务
	"github.com/labstack/echo"
)

// 光哥 15:29
// const DICOMServerURL string = "http://47.93.132.62/api/getByFilmNo" // 测试
const DICOMServerURL string = "http://dicomup.tongxinyiliao.com/api/getByFilmNo" // 生产

func main() {
	e := echo.New()

	e.GET("/api/dicom/:filmno", func(c echo.Context) error {
		m := make(map[string]string)
		m["filmno"] = c.Param("filmno")
		return c.String(http.StatusOK, lib.SendDicomAPIRequest(DICOMServerURL, m))
	})

	// 静态文件服务
	assetHandler := http.FileServer(rice.MustFindBox("static").HTTPBox())
	e.GET("/*", echo.WrapHandler(http.StripPrefix("/", assetHandler)))

	e.Logger.Fatal(e.Start(":1323"))
}
