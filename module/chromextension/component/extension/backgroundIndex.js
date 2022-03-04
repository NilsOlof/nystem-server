/* eslint-disable guard-for-in */
import * as React from "react";
import app from "nystem";

class ExtensionBackgroundIndex extends React.Component {
  constructor(props) {
    super(props);
    const self = this;
    this.tabs = {};
    this.tabLoadCallback = {};
    this.tabLoading = {};
    app().doingEvent = {};
    app().pathErrorClick = {};
    window.chrome.runtime.onMessage.addListener(
      (request, sender, sendResponse) => {
        const tabOptions = self.tabs[sender.tab.id];
        if (!tabOptions) {
          console.log("Missing ", sender.tab);
          return;
        }
        if (request.doEvent) {
          console.log("doEvent", request, app().doingEvent[sender.tab.id]);
          app().doingEvent[sender.tab.id] = false;
          console.log("request.result");
          if (request.result.error === "Path") {
            app().pathErrorClick[sender.tab.id] = request;
            console.log("app().pathErrorClick", app().pathErrorClick);
          } else delete app().pathErrorClick[sender.tab.id];
          app().connection.emit(request);
        } else if (app().pathErrorClick[sender.tab.id]) {
          const response = app().pathErrorClick[sender.tab.id];
          delete app().pathErrorClick[sender.tab.id];
          response.newPath = request.path;
          console.log("response.newPath", response);
          app().connection.emit(response);
        } else if (tabOptions.recording) {
          request.tabId = `${sender.tab.id}`;
          request.url = sender.tab.url;
          if (
            !tabOptions.listenTo ||
            tabOptions.listenTo.length === 0 ||
            tabOptions.listenTo.indexOf(request.event) !== -1
          )
            app().database.eventLog.save({
              data: request,
            });
        }
      }
    );
    // https://developer.window.chrome.com/extensions/tabs
    // https://developer.window.chrome.com/extensions/api_index
    // https://developer.window.chrome.com/extensions/messaging
    app().connection.on("connect", this.connect);
    app().database.tab.on("update", this.updateTabSettings);

    this.saveTab = function (tab, forceUpdate) {
      const tabField = ["url", "title"];
      let changed = false;
      const id = tab.id ? tab.id : tab._id;
      if (!self.tabs[tab.id]) {
        changed = true;
        self.tabs[tab.id] = {};
      }
      const newUrl = tab.url !== self.tabs[id].url;
      for (let i = 0; i < tabField.length; i++)
        if (self.tabs[id][tabField[i]] !== tab[tabField[i]]) {
          changed = true;
          self.tabs[id][tabField[i]] = tab[tabField[i]];
        }
      self.tabs[id]._id = `${id}`;
      if (changed || forceUpdate) {
        const tabOptions = self.tabs[id];
        if (
          newUrl &&
          tabOptions.recording &&
          (!tabOptions.listenTo ||
            tabOptions.listenTo.length === 0 ||
            tabOptions.listenTo.indexOf("url") !== -1)
        )
          app().database.eventLog.save({
            data: {
              name: `URL change ${tabOptions.url}`,
              event: "url",
              url: tabOptions.url,
              title: tabOptions.title,
              tabId: tabOptions._id,
            },
          });
        app().database.tab.save({
          data: tabOptions,
        });
      }
    };
    app().connection.on("extensionEvent", this.extensionEvent);
    window.chrome.webNavigation.onCompleted.addListener((info) => {
      if (info.frameId !== 0) return;
      const tabLoading = self.tabLoading[info.tabId];
      delete self.tabLoading[info.tabId];
      if (tabLoading && tabLoading.callback) tabLoading.callback();
      if (self.tabLoadCallback[info.tabId]) self.tabLoadCallback[info.tabId]();
    });
    window.chrome.webNavigation.onBeforeNavigate.addListener((info) => {
      if (info.frameId !== 0) return;
      if (!self.tabLoading[info.tabId])
        self.tabLoading[info.tabId] = {
          loading: true,
          callback: false,
        };
    });
    window.chrome.tabs.onCreated.addListener(self.saveTab);
    window.chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
      self.saveTab(tab);
    });
    window.chrome.tabs.onRemoved.addListener((id) => {
      delete self.tabs[id];
      app().database.tab.delete({ id });
    });
    window.chrome.contextMenus.create({
      title: "Validate in Testguide eventlog",
      onclick: this.addToEventLog,
      contexts: [
        "page",
        "selection",
        "link",
        "editable",
        "image",
        "video",
        "audio",
      ],
    });
    this.updateTimer = setTimeout(this.updateTabs, 1000 * 10);
    this.state = {};
  }
  updateTabs = () => {
    app()
      .database.tab.search()
      .then(({ data }) =>
        data
          .filter((tab) => !tab.siteScript && !this.tabs[tab._id])
          .forEach((tab) => app().database.tab.delete({ id: tab._id }))
      );
    this.updateTimer = setTimeout(this.updateTabs, 1000 * 60);
  };
  addToEventLog = (info, tab) => {
    // console.log(info, tab);
  };
  updateTabSettings = (items) => {
    if (!items) return;
    const self = this;
    const id = `${Object.keys(items)[0]}`;
    const data = app()
      .database.tab.get({ id })
      .then(({ data }) => {
        if (!data || data.siteScript) {
          console.log(id);
          return;
        }
        if (!self.tabs[data._id].recording && data.recording)
          app().database.eventLog.save({
            data: {
              name: `Recording start ${data.url}`,
              event: "url",
              url: data.url,
              title: data.title,
              tabId: data._id,
            },
          });
        self.tabs[data._id] = data;
      });
    if (data) this.tabs[data._id] = data;
  };
  extensionEvent = (data) => {
    const self = this;
    const tabId = parseInt(data.tabId, 10);
    if (data.doEvent.event === "url") {
      if (this.tabs[data.tabId].url !== data.doEvent.url)
        window.chrome.tabs.update(tabId, { url: data.doEvent.url }, () => {
          self.tabLoadCallback[tabId] = function () {
            data.result = {
              status: "success",
              redirected: true,
            };
            app().connection.emit(data);
          };
        });
      else {
        data.result = {
          status: "success",
          redirected: false,
        };
        app().connection.emit(data);
      }
    } else if (data.doEvent)
      if (this.tabLoading[tabId]) {
        console.log("delay tab");
        this.tabLoading[tabId].callback = function () {
          console.log("delay tab done");
          app().doingEvent[tabId] = data;
          window.chrome.tabs.sendMessage(tabId, data);
        };
      } else {
        app().doingEvent[tabId] = data;
        window.chrome.tabs.sendMessage(tabId, data);
      }
  };
  connect = (data) => {
    const self = this;
    app().connection.emit({
      type: "extensionEvent",
      event: "connectExtension",
    });
    window.chrome.tabs.query({}, (data) => {
      // eslint-disable-next-line no-restricted-syntax
      for (const item in data) self.saveTab(data[item], true);
    });
  };
  componentWillUnmount() {
    app().connection.off("connect", this.connect);
    app().connection.off("extensionEvent", this.extensionEvent);
    clearTimeout(this.updateTimer);
  }
  render() {
    return null;
  }
}
export default ExtensionBackgroundIndex;
