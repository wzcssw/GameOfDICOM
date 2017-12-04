package lib

import (
	"bytes"
	"crypto/md5"
	"encoding/hex"
	"fmt"
	"io/ioutil"
	"net/http"
	"net/url"
	"strings"
	"time"
)

// SendDicomAPIRequest a
func SendDicomAPIRequest(url string, params map[string]string) string {
	params["app_key"] = "SsiYrf"
	params["token"] = "QpFd1F9aInz2"
	params["timestamp"] = time.Now().Format("2006-01-02 15:04:05")
	params["sign"] = sign(params)
	paramsString := urlencode(params)
	fmt.Println(url + "?" + paramsString)
	resp, err := http.Get(url + "?" + paramsString)
	if err != nil {
		panic(err)
	}
	defer resp.Body.Close()
	body, err := ioutil.ReadAll(resp.Body)
	if err != nil {
		panic(err)
	}
	return string(body)
}

func sign(params map[string]string) string {
	result := params["token"] + "app_key" + params["app_key"] + "filmno" + params["filmno"] + "timestamp" + params["timestamp"] + params["token"]
	return strings.ToUpper(GetMD5Hash(result))
}

func urlencode(data map[string]string) string {
	var buf bytes.Buffer
	// for k, v := range data {
	// 	buf.WriteString(url.QueryEscape(k))
	// 	// buf.WriteString(k)
	// 	buf.WriteByte('=')
	// 	buf.WriteString(url.QueryEscape(v))
	// 	// buf.WriteString(v)
	// 	buf.WriteByte('&')
	// }
	buf.WriteString(url.QueryEscape("app_key"))
	buf.WriteByte('=')
	buf.WriteString(url.QueryEscape(data["app_key"]))
	buf.WriteByte('&')
	buf.WriteString(url.QueryEscape("timestamp"))
	buf.WriteByte('=')
	buf.WriteString(url.QueryEscape(data["timestamp"]))
	buf.WriteByte('&')
	buf.WriteString(url.QueryEscape("filmno"))
	buf.WriteByte('=')
	buf.WriteString(url.QueryEscape(data["filmno"]))
	buf.WriteByte('&')
	buf.WriteString(url.QueryEscape("sign"))
	buf.WriteByte('=')
	buf.WriteString(url.QueryEscape(data["sign"]))

	s := buf.String()
	return s
}

// GetMD5Hash G
func GetMD5Hash(text string) string {
	hasher := md5.New()
	hasher.Write([]byte(text))
	return hex.EncodeToString(hasher.Sum(nil))
}
