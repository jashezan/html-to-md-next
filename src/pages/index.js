import React, { useState } from "react";
import axios from "axios";
import TurndownService from "turndown";
import { marked } from "marked";
import Head from "next/head";

const Index = () => {
  const [url, setUrl] = useState("");
  const [md, setMD] = useState("");
  const turndownService = new TurndownService({ headingStyle: "atx" });

  const getHostname = (url) => {
    const parsedUrl = new URL(url);
    return `${parsedUrl.protocol}//${parsedUrl.hostname}`;
  };

  const getAbsoluteURL = (link, content) => {
    const currentUrl = link;
    const htmlContent = content;
    const tempElement = document.createElement("div");
    tempElement.innerHTML = htmlContent;
    const elements = tempElement.querySelectorAll("[href], [src], [data]");
    elements.forEach((element) => {
      const attrName = element.hasAttribute("href")
        ? "href"
        : element.hasAttribute("src")
        ? "src"
        : "data";
      const attrValue = element.getAttribute(attrName);
      if (attrValue && !attrValue.startsWith("http")) {
        element.setAttribute(attrName, `${currentUrl}/${attrValue}`);
      }
    });
    const modifiedHtmlContent = tempElement.innerHTML;
    return modifiedHtmlContent;
  };

  const autoSize = (event) => {
    const element = event.target;
    element.rows = 1;
    element.rows = Math.ceil(element.scrollHeight / 24); // adjust 20 as needed
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      const response = await axios.get(`/api/fetch-html?url=${url}`);
      const hostname = getHostname(url);
      const markdown = await response.data.replace(
        /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>|<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>|<nav\b[^<]*(?:(?!<\/nav>)<[^<]*)*<\/nav>/gi,
        ""
      );
      setMD(turndownService.turndown(getAbsoluteURL(hostname, markdown)));
      setUrl("");
    } catch (error) {
      setMD(error);
    }
  };

  return (
    <>
      <Head>
        <title>HTML To MD Renderer</title>
      </Head>
      <main className="bg-indigo-300 min-h-screen">
        <section className="min-w-full grid place-items-center">
          <form
            method="post"
            className="mt-4 sm:flex sm:max-w-xl"
            onSubmit={handleSubmit}
          >
            <input
              type="text"
              name="url"
              id="url"
              required
              className="appearance-none w-full bg-white border border-transparent rounded-md py-2 px-4 text-base text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-white focus:border-white focus:placeholder-gray-400"
              placeholder="https://jashezan/github.io"
              value={url}
              onChange={(event) => setUrl(event.target.value)}
            />
            <div className="mt-3 rounded-md sm:mt-0 sm:ml-3 sm:flex-shrink-0">
              <button
                type="submit"
                className="w-full bg-green-600 border border-transparent rounded-md py-2 px-4 flex items-center justify-center text-base font-medium text-white hover:bg-green-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-indigo-500"
              >
                Fetch
              </button>
            </div>
          </form>
        </section>
        <div className="grid grid-cols-1 md:grid-cols-2 h-4/5">
          <section className="w-full md:w-50 p-2 md:p-5 h-full">
            <h2 className="block text-center">
              <span className="float-left text-sm">
                {"Characters: " + md.length}
              </span>{" "}
              <span className="font-bold">Code</span>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(md);
                }}
                className="bg-blue-500 hover:bg-blue-700 text-white p-1 ml-2 rounded text-sm active:bg-green-700 float-right"
              >
                Copy
              </button>
            </h2>
            <textarea
              name="markdown"
              id="markdown"
              className="shadow-sm p-2 h-[60vh] md:min-h-[85vh] md:h-min resize-none focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-900 rounded-md"
              placeholder="Add your comment..."
              defaultValue={md}
              onChange={(e) => {
                setMD(e.target.value.trim());
                autoSize(e);
              }}
            />
          </section>
          <section className="w-full md:w-50 p-2 md:p-5">
            <h2 className="block font-bold text-center">Preview</h2>
            <div
              className="prose"
              dangerouslySetInnerHTML={{ __html: marked.parse(md) }}
            ></div>
          </section>
        </div>
      </main>
    </>
  );
};

export default Index;
