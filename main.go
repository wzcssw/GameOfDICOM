package main

import (
	"GameOfDICOM/lib"
	"net/http"

	"github.com/GeertJohan/go.rice"
	"github.com/labstack/echo"
)

// DICOMServerURL DICOMServerURL
const DICOMServerURL string = "http://dicomtest.tongxinyiliao.com/api/getByFilmNo"

func main() {
	e := echo.New()

	e.GET("/api/dicom/:filmno", func(c echo.Context) error {
		m := make(map[string]string)
		m["filmno"] = c.Param("filmno")
		return c.String(http.StatusOK, lib.SendDicomAPIRequest(DICOMServerURL, m))
	})

	// 静态文件服务
	assetHandler := http.FileServer(rice.MustFindBox("static").HTTPBox())
	e.GET("/assets/*", echo.WrapHandler(http.StripPrefix("/assets/", assetHandler)))

	e.Logger.Fatal(e.Start(":1323"))
}
