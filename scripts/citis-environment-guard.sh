normalize_environment_value() {
  local value="${1:-}"
  value="${value,,}"
  value="${value#"${value%%[![:space:]]*}"}"
  value="${value%"${value##*[![:space:]]}"}"
  printf '%s' "$value"
}

normalize_citis_environment() {
  normalize_environment_value "${CITIS_ENVIRONMENT:-}"
}

validate_data_transfer_environment() {
  local configured_environment
  configured_environment="$(normalize_citis_environment)"
  local node_environment
  node_environment="$(normalize_environment_value "${NODE_ENV:-}")"
  local deployment_marker
  deployment_marker="$(normalize_environment_value "${REPLIT_DEPLOYMENT:-}")"

  if [[ "$node_environment" == "production" || "$deployment_marker" == "1" ]]; then
    echo "This data-transfer script is disabled in production runtimes." >&2
    return 1
  fi

  case "$configured_environment" in
    development)
      return 0
      ;;
    "")
      echo "CITIS_ENVIRONMENT must be explicitly set to development for this data-transfer script." >&2
      return 1
      ;;
    staging)
      echo "This production data-transfer script is disabled in staging mode." >&2
      return 1
      ;;
    production)
      echo "This data-transfer script cannot use the production application environment." >&2
      return 1
      ;;
    *)
      echo "CITIS_ENVIRONMENT must be development, staging, or production." >&2
      return 1
      ;;
  esac
}
