import os
import sys
from importlib.util import module_from_spec, spec_from_file_location
from flask import Flask, jsonify


def load_tests_app():
    base_dir = os.path.dirname(os.path.abspath(__file__))
    tests_app_path = os.path.join(base_dir, 'tests', 'app.py')

    if not os.path.isfile(tests_app_path):
        raise FileNotFoundError(f"Missing tests app file: {tests_app_path}")

    tests_dir = os.path.join(base_dir, 'tests')
    if tests_dir not in sys.path:
        sys.path.insert(0, tests_dir)

    spec = spec_from_file_location('tests_app_main', tests_app_path)
    module = module_from_spec(spec)
    sys.modules['tests_app_main'] = module
    spec.loader.exec_module(module)

    if not hasattr(module, 'app'):
        raise AttributeError('tests/app.py did not expose a Flask app instance named "app"')

    if hasattr(module, 'initialize_app'):
        module.initialize_app()

    return module.app


try:
    app = load_tests_app()
except Exception as exc:
    app = Flask(__name__)

    @app.route('/')
    def index():
        return jsonify({
            'error': 'Failed to load the test Flask application',
            'detail': str(exc),
            'hint': 'Run python tests/app.py directly to start the full page application.'
        }), 500

    @app.route('/api/hello')
    def hello():
        return jsonify({'message': 'Hello from Flask fallback app'}), 200


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=int(os.getenv('PORT', 5000)), debug=False)
