
import 'package:flutter/material.dart';
import 'package:get_storage/get_storage.dart';
import 'package:webview_flutter/webview_flutter.dart';

class GameBasketBall extends StatefulWidget {
  const GameBasketBall({super.key});

  @override
  State<GameBasketBall> createState() => _GameBasketBallState();
}

class _GameBasketBallState extends State<GameBasketBall> {
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
            storage.write("highscore", data[0]);
            storage.write("score", data[1]);
          } else {
            print("Quit");
            Navigator.pop(context);
          }
        }
      )..loadRequest(
        Uri.parse("https://games.monstercode.net/basket/")
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