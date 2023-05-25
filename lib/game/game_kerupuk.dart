import 'package:flutter/material.dart';
import 'package:get_storage/get_storage.dart';
import 'package:webview_flutter/webview_flutter.dart';

class GameKerupuk extends StatefulWidget {
  const GameKerupuk({super.key});

  @override
  State<GameKerupuk> createState() => _GameKerupukState();
}

class _GameKerupukState extends State<GameKerupuk> {
  late final WebViewController _controller;
  final storage = GetStorage();

  Future<void> clearCache() async {
    await _controller.clearCache();
    print("Cache cleared");
  }

  @override
  void initState() {
    // #docregion webview_controller
    _controller = WebViewController()
      ..setJavaScriptMode(JavaScriptMode.unrestricted)
      ..setBackgroundColor(const Color.fromARGB(0, 31, 153, 229))
      ..setNavigationDelegate(
        NavigationDelegate(
          onProgress: (int progress) {
            // Update loading bar.
            print(progress);
          },
          onPageStarted: (String url) {},
          onPageFinished: (String url) {},
          onWebResourceError: (WebResourceError error) {},
          onNavigationRequest: (NavigationRequest request) {
            if (request.url.startsWith('https://www.youtube.com/')) {
              return NavigationDecision.prevent;
            }
            return NavigationDecision.navigate;
          },
        ),
      )
      ..addJavaScriptChannel(
        'Print', 
        onMessageReceived: (JavaScriptMessage message) {
          String msg  = message.message;
          print("Message $msg"); 
          if(msg != "quit") {
            var data = msg.split(",");
            print("HighScore : ${data[0]}, Score : ${data[1]}");
            storage.write("highscore1", data[0]);
            storage.write("score1", data[1]);
          } else {
            print("Quit");
            Navigator.pop(context);
          }
        }
      )..loadRequest(
        Uri.parse("https://games.monstercode.net/kerupuk/")
      );
    // #enddocregion webview_controller
    //clearCache();
    super.initState();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: WebViewWidget(
        controller: _controller,
      ),
    );
  }
}