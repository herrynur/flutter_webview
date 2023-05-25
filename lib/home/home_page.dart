import 'package:flutter/material.dart';
import 'package:flutter_webview/game/game_basketball.dart';
import 'package:flutter_webview/game/game_cendol.dart';
import 'package:flutter_webview/game/game_kerupuk.dart';
import 'package:flutter_webview/game/game_panjat_pinang.dart';
import 'package:get_storage/get_storage.dart';

class HomePage extends StatefulWidget {
  const HomePage({super.key});

  @override
  State<HomePage> createState() => _HomePageState();
}

class _HomePageState extends State<HomePage> {
  var highscore = 0;
  var score = 0;

  var highscore1 = 0;
  var score1 = 0;

  @override
  void initState() {
    if(GetStorage().hasData("highscore") == true) {
      highscore = int.parse(GetStorage().read("highscore"));
      score = int.parse(GetStorage().read("score"));
      highscore1 = int.parse(GetStorage().read("highscore1"));
      score1 = int.parse(GetStorage().read("score1"));
    }
    super.initState();
  }

  Future<void> _refresh() async {
    if(GetStorage().hasData("highscore") == true) {
      setState(() {
        highscore = int.parse(GetStorage().read("highscore"));
        score = int.parse(GetStorage().read("score"));
        print("HighScore : $highscore, Score : $score");
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Home Page'),
      ),
      body: Center(
        child: Column(
          children: [
            Center(
              child: Column(
                children: [
                  Text(
                    "Last HighScore : $highscore",
                    style: const TextStyle(
                      fontSize: 20,
                      fontWeight: FontWeight.bold
                    ),
                  ),
                  Text(
                    "Last Score : $score",
                    style: const TextStyle(
                      fontSize: 20,
                      fontWeight: FontWeight.bold
                    ),
                  ),
                ],
              ),
            ),
            Padding(
              padding: const EdgeInsets.all(8.0),
              child: ElevatedButton(
                onPressed: () {
                  Navigator.push(
                    context,
                    MaterialPageRoute(builder: (context) => const GameBasketBall()),
                  );
                },
                child: const Text("Play Game BasketBall")
              ),
            ),
            Center(
              child: Column(
                children: [
                  Text(
                    "Last HighScore : $highscore1",
                    style: const TextStyle(
                      fontSize: 20,
                      fontWeight: FontWeight.bold
                    ),
                  ),
                  Text(
                    "Last Score : $score1",
                    style: const TextStyle(
                      fontSize: 20,
                      fontWeight: FontWeight.bold
                    ),
                  ),
                ],
              ),
            ),
            Padding(
              padding: const EdgeInsets.all(8.0),
              child: ElevatedButton(
                onPressed: () {
                  Navigator.push(
                    context,
                    MaterialPageRoute(builder: (context) => const GameKerupuk()),
                  );
                },
                child: const Text("Play Game Kerupuk")
              ),
            ),
            Center(
              child: Column(
                children: [
                  Text(
                    "Last HighScore : $highscore1",
                    style: const TextStyle(
                      fontSize: 20,
                      fontWeight: FontWeight.bold
                    ),
                  ),
                  Text(
                    "Last Score : $score1",
                    style: const TextStyle(
                      fontSize: 20,
                      fontWeight: FontWeight.bold
                    ),
                  ),
                ],
              ),
            ),
            Padding(
              padding: const EdgeInsets.all(8.0),
              child: ElevatedButton(
                onPressed: () {
                  Navigator.push(
                    context,
                    MaterialPageRoute(builder: (context) => const GamePanjatPinang()),
                  );
                },
                child: const Text("Play Game Panjat Pinang")
              ),
            ),
            Padding(
              padding: const EdgeInsets.all(8.0),
              child: ElevatedButton(
                onPressed: () {
                  _refresh();
                },
                child: const Text("Refresh")
              ),
            ),
             Padding(
              padding: const EdgeInsets.all(8.0),
              child: ElevatedButton(
                onPressed: () {
                  Navigator.push(
                    context,
                    MaterialPageRoute(builder: (context) => const GameCendol()),
                  );
                },
                child: const Text("Play Game Cendol")
              ),
            ),
            Padding(
              padding: const EdgeInsets.all(8.0),
              child: ElevatedButton(
                onPressed: () {
                  _refresh();
                },
                child: const Text("Refresh")
              ),
            ),
          ],
        )
      ),
    );
  }
}